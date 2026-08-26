#!/usr/bin/env node
/**
 * Stages B and C of the Domain Architecture Redesign migration plan
 * (architecture doc §7). Strictly additive: existing collections and
 * fields are never deleted or overwritten, only extended with new
 * reference fields alongside the legacy free-text ones.
 *
 * Stage B — backfill: create people/{uid} for every existing users/{uid},
 * mirroring displayName/photoURL/phone. Mechanical, 1:1, no ambiguity.
 *
 * Stage C — resolve: for sermons.speakerName, sermons.seriesTitle,
 * ministries.leaderName, smallGroups.leaderName, events.organizerName,
 * galleryImages.photographer, match the free-text value against existing
 * Person/Series records by exact (case-insensitive) name.
 *   - exactly one match  -> write the new ref field
 *   - no match            -> left unresolved, logged
 *   - more than one match -> left unresolved, logged (never guessed)
 * A Person is NEVER created automatically from an unmatched name — only
 * Stage B (from a real users/{uid} account) creates Person docs. Ambiguous
 * or unmatched free-text names are reported for an administrator to
 * resolve by hand (e.g. via the People tab + person pickers).
 *
 * Usage:
 *   node scripts/migrate-domain-model.js            # dry run (default) — reports only, writes nothing
 *   node scripts/migrate-domain-model.js --execute   # performs the writes described above
 *
 * Requires FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL /
 * FIREBASE_ADMIN_PRIVATE_KEY in .env.local (see .env.example) — same as
 * scripts/seed-firestore-content.js.
 */
require('dotenv').config({ path: '.env.local' });
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const EXECUTE = process.argv.includes('--execute');

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env.local');
  process.exit(1);
}

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
});
const db = getFirestore();

function normalize(name) {
  return (name || '').trim().toLowerCase();
}

// ---- Stage B: backfill Person from User ----

async function backfillPeopleFromUsers() {
  console.log(`\n=== Stage B: backfill people/{uid} from users/{uid} ${EXECUTE ? '(EXECUTING)' : '(dry run)'} ===`);
  const usersSnap = await db.collection('users').get();
  let created = 0;
  let alreadyLinked = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const user = userDoc.data();
    const personRef = db.collection('people').doc(uid);
    const personSnap = await personRef.get();

    if (personSnap.exists) {
      alreadyLinked += 1;
      continue;
    }

    const displayName = user.displayName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Unnamed';
    const now = new Date().toISOString();
    const record = {
      displayName,
      photoUrl: user.photoURL ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      isStaff: false,
      userId: uid,
      status: user.isActive === false ? 'inactive' : 'active',
      createdAt: now,
      updatedAt: now,
    };

    console.log(`  users/${uid} -> people/${uid} (${displayName})`);
    if (EXECUTE) await personRef.set(record);
    created += 1;
  }

  console.log(`Stage B summary: ${usersSnap.size} user(s) scanned, ${created} person record(s) ${EXECUTE ? 'created' : 'would be created'}, ${alreadyLinked} already linked.`);
}

// ---- Stage C: resolve free-text names to refs ----

/**
 * Builds a normalized-name -> [id, ...] index for a collection, used to
 * decide whether a free-text value matches exactly one existing document.
 */
async function buildNameIndex(collectionName, nameField) {
  const snap = await db.collection(collectionName).get();
  const index = new Map();
  snap.docs.forEach((d) => {
    const key = normalize(d.data()[nameField]);
    if (!key) return;
    const list = index.get(key) ?? [];
    list.push(d.id);
    index.set(key, list);
  });
  return index;
}

/**
 * Resolves one free-text field on every doc in `collectionName` against
 * `nameIndex`, writing `refField` (string or string[], per `multi`) when
 * exactly one match is found. Returns counts + the unresolved log.
 */
async function resolveField({ collectionName, textField, refField, nameIndex, multi = false }) {
  const snap = await db.collection(collectionName).get();
  let resolved = 0;
  let alreadyResolved = 0;
  let noText = 0;
  const unresolved = []; // { id, text, reason, candidates }

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const existingRef = data[refField];
    const hasRef = multi ? Array.isArray(existingRef) && existingRef.length > 0 : !!existingRef;
    if (hasRef) { alreadyResolved += 1; continue; }

    const text = data[textField];
    if (!text || !normalize(text)) { noText += 1; continue; }

    const candidates = nameIndex.get(normalize(text)) ?? [];
    if (candidates.length === 1) {
      const value = multi ? [candidates[0]] : candidates[0];
      console.log(`  ${collectionName}/${docSnap.id}: "${text}" -> ${refField}=${JSON.stringify(value)}`);
      if (EXECUTE) await docSnap.ref.update({ [refField]: value });
      resolved += 1;
    } else {
      unresolved.push({ id: docSnap.id, text, reason: candidates.length === 0 ? 'no_match' : 'ambiguous', candidates });
    }
  }

  console.log(`  ${collectionName}.${textField} -> ${refField}: ${resolved} resolved, ${unresolved.length} unresolved, ${alreadyResolved} already resolved, ${noText} with no text value.`);
  if (unresolved.length > 0) {
    console.log(`  Unresolved (needs manual review via the admin People tab):`);
    unresolved.forEach((u) => console.log(`    - ${collectionName}/${u.id}: "${u.text}" [${u.reason}]${u.candidates.length ? ` candidates=${u.candidates.join(',')}` : ''}`));
  }
  return { resolved, unresolved, alreadyResolved, noText };
}

async function resolveNameFields() {
  console.log(`\n=== Stage C: resolve free-text names to references ${EXECUTE ? '(EXECUTING)' : '(dry run)'} ===`);
  const peopleIndex = await buildNameIndex('people', 'displayName');
  const seriesIndex = await buildNameIndex('series', 'title');

  const results = {};
  results.sermonSpeakers = await resolveField({ collectionName: 'sermons', textField: 'speakerName', refField: 'speakerId', nameIndex: peopleIndex });
  results.sermonSeries = await resolveField({ collectionName: 'sermons', textField: 'seriesTitle', refField: 'seriesId', nameIndex: seriesIndex });
  results.ministryLeaders = await resolveField({ collectionName: 'ministries', textField: 'leaderName', refField: 'leaderIds', nameIndex: peopleIndex, multi: true });
  results.groupLeaders = await resolveField({ collectionName: 'smallGroups', textField: 'leaderName', refField: 'leaderIds', nameIndex: peopleIndex, multi: true });
  results.eventOrganizers = await resolveField({ collectionName: 'events', textField: 'organizerName', refField: 'organizerId', nameIndex: peopleIndex });
  results.galleryPhotographers = await resolveField({ collectionName: 'galleryImages', textField: 'photographer', refField: 'photographerId', nameIndex: peopleIndex });

  const totalResolved = Object.values(results).reduce((sum, r) => sum + r.resolved, 0);
  const totalUnresolved = Object.values(results).reduce((sum, r) => sum + r.unresolved.length, 0);
  console.log(`\nStage C summary: ${totalResolved} relationship(s) ${EXECUTE ? 'resolved' : 'would be resolved'}, ${totalUnresolved} left unresolved for manual review.`);
  return results;
}

async function main() {
  if (!EXECUTE) {
    console.log('DRY RUN — no writes will be made. Pass --execute to apply these changes.');
  }
  await backfillPeopleFromUsers();
  await resolveNameFields();
  console.log('\nDone.' + (EXECUTE ? '' : ' Re-run with --execute once these results look correct.'));
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

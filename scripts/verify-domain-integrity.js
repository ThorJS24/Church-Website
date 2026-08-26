#!/usr/bin/env node
/**
 * Referential-integrity check for the domain model redesign (architecture
 * doc §11, verification plan item 1). Read-only — makes no writes. Confirms
 * every reference field added by the redesign points at a document that
 * actually exists, and reports the exact acceptance-test queries from the
 * brief so their answers can be eyeballed against real data.
 *
 * Usage: node scripts/verify-domain-integrity.js
 * Requires FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL /
 * FIREBASE_ADMIN_PRIVATE_KEY in .env.local.
 */
require('dotenv').config({ path: '.env.local' });
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env.local');
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }) });
const db = getFirestore();

let dangling = 0;

async function existingIds(collectionName) {
  const snap = await db.collection(collectionName).select().get();
  return new Set(snap.docs.map((d) => d.id));
}

function checkRef(sourceLabel, docId, field, value, validIds, targetCollection) {
  if (value === undefined || value === null || value === '') return;
  const ids = Array.isArray(value) ? value : [value];
  ids.forEach((refId) => {
    if (!validIds.has(refId)) {
      console.log(`  DANGLING: ${sourceLabel}/${docId}.${field} -> ${targetCollection}/${refId} does not exist`);
      dangling += 1;
    }
  });
}

async function main() {
  console.log('Loading id sets...');
  const [peopleIds, ministryIds, groupIds, locationIds, seriesIds, mediaAssetIds, eventIds, opportunityIds] = await Promise.all([
    existingIds('people'),
    existingIds('ministries'),
    existingIds('smallGroups'),
    existingIds('locations'),
    existingIds('series'),
    existingIds('mediaAssets'),
    existingIds('events'),
    existingIds('volunteerOpportunities'),
  ]);

  console.log('\nChecking sermons (speakerId -> people, seriesId -> series, mediaAssetId -> mediaAssets)...');
  const sermonsSnap = await db.collection('sermons').get();
  sermonsSnap.docs.forEach((d) => {
    const s = d.data();
    checkRef('sermons', d.id, 'speakerId', s.speakerId, peopleIds, 'people');
    checkRef('sermons', d.id, 'seriesId', s.seriesId, seriesIds, 'series');
    checkRef('sermons', d.id, 'mediaAssetId', s.mediaAssetId, mediaAssetIds, 'mediaAssets');
  });

  console.log('Checking ministries (leaderIds -> people)...');
  const ministriesSnap = await db.collection('ministries').get();
  ministriesSnap.docs.forEach((d) => checkRef('ministries', d.id, 'leaderIds', d.data().leaderIds, peopleIds, 'people'));

  console.log('Checking smallGroups (ministryId -> ministries, leaderIds -> people, locationId -> locations)...');
  const groupsSnap = await db.collection('smallGroups').get();
  groupsSnap.docs.forEach((d) => {
    const g = d.data();
    checkRef('smallGroups', d.id, 'ministryId', g.ministryId, ministryIds, 'ministries');
    checkRef('smallGroups', d.id, 'leaderIds', g.leaderIds, peopleIds, 'people');
    checkRef('smallGroups', d.id, 'locationId', g.locationId, locationIds, 'locations');
  });

  console.log('Checking events (organizerId -> people, ministryId -> ministries, groupId -> smallGroups, locationId -> locations)...');
  const eventsSnap = await db.collection('events').get();
  eventsSnap.docs.forEach((d) => {
    const e = d.data();
    checkRef('events', d.id, 'organizerId', e.organizerId, peopleIds, 'people');
    checkRef('events', d.id, 'ministryId', e.ministryId, ministryIds, 'ministries');
    checkRef('events', d.id, 'groupId', e.groupId, groupIds, 'smallGroups');
    checkRef('events', d.id, 'locationId', e.locationId, locationIds, 'locations');
  });

  console.log('Checking galleryImages (photographerId -> people)...');
  const gallerySnap = await db.collection('galleryImages').get();
  gallerySnap.docs.forEach((d) => checkRef('galleryImages', d.id, 'photographerId', d.data().photographerId, peopleIds, 'people'));

  console.log('Checking volunteerOpportunities (ministryId -> ministries, eventId -> events)...');
  const opportunitiesSnap = await db.collection('volunteerOpportunities').get();
  opportunitiesSnap.docs.forEach((d) => {
    const o = d.data();
    checkRef('volunteerOpportunities', d.id, 'ministryId', o.ministryId, ministryIds, 'ministries');
    checkRef('volunteerOpportunities', d.id, 'eventId', o.eventId, eventIds, 'events');
  });

  console.log('Checking volunteerAssignments (opportunityId -> volunteerOpportunities, personId -> people)...');
  const assignmentsSnap = await db.collection('volunteerAssignments').get();
  assignmentsSnap.docs.forEach((d) => {
    const a = d.data();
    checkRef('volunteerAssignments', d.id, 'opportunityId', a.opportunityId, opportunityIds, 'volunteerOpportunities');
    checkRef('volunteerAssignments', d.id, 'personId', a.personId, peopleIds, 'people');
  });

  console.log('Checking ministryMemberships / groupMemberships (personId, ministryId/groupId)...');
  const [ministryMembershipsSnap, groupMembershipsSnap] = await Promise.all([
    db.collection('ministryMemberships').get(),
    db.collection('groupMemberships').get(),
  ]);
  ministryMembershipsSnap.docs.forEach((d) => {
    checkRef('ministryMemberships', d.id, 'personId', d.data().personId, peopleIds, 'people');
    checkRef('ministryMemberships', d.id, 'ministryId', d.data().ministryId, ministryIds, 'ministries');
  });
  groupMembershipsSnap.docs.forEach((d) => {
    checkRef('groupMemberships', d.id, 'personId', d.data().personId, peopleIds, 'people');
    checkRef('groupMemberships', d.id, 'groupId', d.data().groupId, groupIds, 'smallGroups');
  });

  console.log(`\n${dangling === 0 ? 'PASS' : 'FAIL'}: ${dangling} dangling reference(s) found.`);

  console.log('\n--- Acceptance-test spot checks ---');
  console.log(`Ministries with at least one leader: ${ministriesSnap.docs.filter((d) => (d.data().leaderIds ?? []).length > 0).length} / ${ministriesSnap.size}`);
  console.log(`Groups linked to a ministry: ${groupsSnap.docs.filter((d) => !!d.data().ministryId).length} / ${groupsSnap.size}`);
  console.log(`Events with an organizer: ${eventsSnap.docs.filter((d) => !!d.data().organizerId).length} / ${eventsSnap.size}`);
  console.log(`Sermons with a resolved speaker: ${sermonsSnap.docs.filter((d) => !!d.data().speakerId).length} / ${sermonsSnap.size}`);
  console.log(`Sermons with a resolved series: ${sermonsSnap.docs.filter((d) => !!d.data().seriesId).length} / ${sermonsSnap.size}`);

  process.exit(dangling === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

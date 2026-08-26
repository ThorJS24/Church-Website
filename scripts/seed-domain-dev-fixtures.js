#!/usr/bin/env node
/**
 * Local-dev-only fixture data for the new domain model: a couple of
 * People, a Location, a Ministry with a leader, a Group under that
 * ministry, and a Volunteer Opportunity — enough linked data to exercise
 * every relationship in the redesign (see architecture doc's acceptance
 * tests) without guessing at real production content.
 *
 * Deliberately separate from scripts/seed-firestore-content.js, which is
 * production-safe starter content and intentionally leaves ministries/
 * events/sermons empty — this script is for local development and manual
 * verification only. Do not run it against a production project.
 *
 * Usage: node scripts/seed-domain-dev-fixtures.js
 * Requires FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL /
 * FIREBASE_ADMIN_PRIVATE_KEY in .env.local, pointed at a dev/staging project.
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

async function upsert(collection, id, data) {
  await db.collection(collection).doc(id).set(data, { merge: true });
  console.log(`  ${collection}/${id}`);
}

async function main() {
  const now = new Date().toISOString();

  console.log('Seeding people...');
  await upsert('people', 'dev-person-pastor', {
    displayName: 'Rev. Sample Pastor', title: 'Senior Pastor', bio: 'Fixture record for local development.',
    email: 'pastor@example.test', phone: null, isStaff: true, userId: null, status: 'active', createdAt: now, updatedAt: now,
  });
  await upsert('people', 'dev-person-leader', {
    displayName: 'Sample Group Leader', title: 'Small Group Leader', bio: 'Fixture record for local development.',
    email: 'leader@example.test', phone: null, isStaff: false, userId: null, status: 'active', createdAt: now, updatedAt: now,
  });

  console.log('Seeding a location...');
  await upsert('locations', 'dev-location-main', {
    name: 'Main Sanctuary', address: '123 Fixture St', accessibilityInfo: 'Wheelchair accessible entrance at the north door.',
  });

  console.log('Seeding a ministry linked to a leader...');
  await upsert('ministries', 'dev-ministry-outreach', {
    title: 'Community Outreach', description: 'Fixture ministry for exercising leader/group/event relationships.',
    category: 'outreach', leaderIds: ['dev-person-pastor'], status: 'published',
  });

  console.log('Seeding a group linked to the ministry and a leader...');
  await upsert('smallGroups', 'dev-group-outreach-team', {
    name: 'Outreach Team', description: 'Fixture group for exercising ministry -> group -> leader relationships.',
    ministryId: 'dev-ministry-outreach', leaderIds: ['dev-person-leader'], locationId: 'dev-location-main',
    meetingSchedule: 'Tuesdays at 6pm', status: 'published',
  });

  console.log('Seeding a volunteer opportunity linked to the ministry...');
  await upsert('volunteerOpportunities', 'dev-opportunity-food-drive', {
    title: 'Food Drive Helper', description: 'Fixture opportunity for exercising ministry -> opportunity -> assignment relationships.',
    ministryId: 'dev-ministry-outreach', area: 'Outreach', spotsNeeded: 5, spotsFilled: 0, status: 'open',
  });

  console.log('\nDone. Verify with: node scripts/verify-domain-integrity.js');
}

main().catch((err) => {
  console.error('Seeding dev fixtures failed:', err);
  process.exit(1);
});

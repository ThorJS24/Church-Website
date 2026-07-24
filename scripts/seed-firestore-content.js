#!/usr/bin/env node
/**
 * Seeds Firestore with starter content so the public site isn't empty right
 * after the Sanity -> Firestore migration. Safe to re-run: every write uses
 * a fixed doc id and `{ merge: true }`, so it never duplicates documents or
 * clobbers content someone has already edited through the admin panel.
 *
 * Usage: node scripts/seed-firestore-content.js
 * Requires FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL /
 * FIREBASE_ADMIN_PRIVATE_KEY in .env.local (see .env.example).
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

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
});
const db = getFirestore();

async function seedDoc(collection, id, data) {
  await db.collection(collection).doc(id).set(data, { merge: true });
  console.log(`  ${collection}/${id}`);
}

async function seedCollectionIfEmpty(collection, docs) {
  const existing = await db.collection(collection).limit(1).get();
  if (!existing.empty) {
    console.log(`  ${collection}: already has content, skipping`);
    return;
  }
  for (const d of docs) {
    await db.collection(collection).add(d);
  }
  console.log(`  ${collection}: seeded ${docs.length} document(s)`);
}

async function main() {
  console.log('Seeding site settings...');
  await seedDoc('siteSettings', 'main', {
    churchName: 'Salem Primitive Baptist Church',
    tagline: 'A place where faith meets community, and hope comes alive',
    address: '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008',
    phoneNumber: '+91 94871 62485',
    email: 'contact@salempbc.in',
    statistics: { members: '500+', yearsServing: '25+', weeklyServices: '3', ministries: '15+' },
    officeHours: ['Mon–Fri: 9:00 AM – 5:00 PM'],
  });

  console.log('Seeding page content...');
  await seedDoc('pageContent', 'about', {
    title: 'Our Beliefs & About Us',
    subtitle: 'Learn about our church family and what we believe',
    mission: 'To proclaim the Gospel of Jesus Christ, nurture believers through sound teaching, and build a community grounded in grace, faith, and love.',
    vision: 'To be a Christ-centered church that transforms lives and communities through faith, love, and service — equipping every believer to live with purpose.',
    beliefsSectionTitle: 'What We Believe',
    beliefs: [],
    valuesSectionTitle: 'Core Values',
    values: [],
  });
  await seedDoc('pageContent', 'services', {
    title: 'Join Us for Worship',
    subtitle: 'Everyone is welcome at Salem Primitive Baptist Church',
    whatToExpectSectionTitle: 'What to Expect',
    whatToExpect: [],
    specialEventsSectionTitle: 'Special Services',
    specialEvents: [],
    onlineServicesTitle: 'Watch Online',
    onlineServicesDescription: 'Join our services from anywhere via livestream.',
    planYourVisitTitle: 'Plan Your Visit',
    planYourVisitDescription: "We can't wait to welcome you.",
    planYourVisit: [],
  });
  await seedDoc('pageContent', 'ministries', {
    title: 'Our Ministries',
    subtitle: 'Find your place to serve, grow, and make a difference in our community',
    categories: [
      { id: 'children', label: 'Children' },
      { id: 'youth', label: 'Youth' },
      { id: 'adults', label: 'Adults' },
      { id: 'worship', label: 'Worship' },
      { id: 'outreach', label: 'Outreach' },
    ],
  });
  await seedDoc('pageContent', 'community', {
    title: 'Community & Outreach',
    subtitle: 'Serving our community with love and compassion',
    missions: [],
    outreachStories: [],
    communityResources: [],
    testimonies: [],
  });
  await seedDoc('pageContent', 'branches', {
    title: 'Our Branches',
    subtitle: "Spreading God's love across communities",
    branches: [],
  });

  console.log('Seeding weekly service times...');
  await seedCollectionIfEmpty('services', [
    { title: 'Sunday Morning Worship', time: '09:30', location: 'Main Sanctuary', description: 'Our main weekly worship gathering with singing, prayer, and preaching.' },
    { title: 'Wednesday Bible Study', time: '18:30', location: 'Fellowship Hall', description: 'Midweek Bible study and prayer.' },
  ]);

  console.log('Seeding ambient audio placeholder (inactive by default)...');
  await seedDoc('ambientAudio', 'current', { title: '', audioUrl: '', volume: 0.3, isActive: false });

  console.log('Seeding livestream placeholder (offline by default)...');
  await seedDoc('livestream', 'current', { title: 'Sunday Service', isLive: false, streamType: 'youtube', chatEnabled: false });

  console.log('\nDone. Everything else (sermons, events, gallery, pastors, ministries,\n' +
    'announcements, history) is intentionally left empty — add real content\n' +
    'through the admin panel once Phase 2 is built, or write directly to\n' +
    'Firestore in the meantime.');
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

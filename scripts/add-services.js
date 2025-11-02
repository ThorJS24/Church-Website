const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

const servicesData = [
  // Individual Service Documents
  {
    _type: 'service',
    title: 'Sunday Morning Worship',
    time: '10:30 AM',
    location: 'Main Sanctuary',
    description: 'Our main worship service featuring congregational singing of traditional hymns, prayer, and expository preaching from God\'s Word.'
  },
  {
    _type: 'service',
    title: 'Sunday School',
    time: '9:30 AM',
    location: 'Various Classrooms',
    description: 'Bible study classes for all ages with dedicated teachers providing age-appropriate lessons from Scripture.'
  },
  {
    _type: 'service',
    title: 'Sunday Evening Service',
    time: '6:00 PM',
    location: 'Main Sanctuary',
    description: 'A more intimate worship service with singing, prayer, and biblical teaching.'
  },
  {
    _type: 'service',
    title: 'Wednesday Bible Study',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    description: 'Midweek Bible study and prayer meeting where we dive deeper into God\'s Word and pray for one another.'
  },

  // Updated Services Page with proper structure
  {
    _id: 'services-page-main',
    _type: 'servicesPage',
    title: 'Our Worship Services',
    subtitle: 'Join us as we gather to worship God, study His Word, and fellowship together as believers.',
    whatToExpectSectionTitle: 'What to Expect',
    whatToExpect: [
      {
        title: 'Warm Welcome',
        description: 'Our greeters and members will welcome you with genuine Christian love and help you feel at home.'
      },
      {
        title: 'Traditional Worship',
        description: 'We worship with traditional hymns, heartfelt prayers, and reverent atmosphere.'
      },
      {
        title: 'Biblical Preaching',
        description: 'Expository preaching that faithfully teaches God\'s Word verse by verse.'
      },
      {
        title: 'Fellowship Time',
        description: 'Opportunities to meet other believers and build lasting Christian friendships.'
      },
      {
        title: 'Come as You Are',
        description: 'No dress code required - come as you are and focus on worshiping God.'
      },
      {
        title: 'Family Friendly',
        description: 'Children are welcome in all services with nursery care available for infants.'
      }
    ],
    specialEventsSectionTitle: 'Special Services & Events',
    specialEvents: [
      {
        title: 'Homecoming',
        date: 'Annual',
        description: 'Special day of celebration with dinner on the grounds and fellowship.'
      },
      {
        title: 'Revival Services',
        date: 'Spring & Fall',
        description: 'Week-long revival meetings with visiting preachers and special singing.'
      },
      {
        title: 'Christmas Service',
        date: 'December',
        description: 'Special Christmas worship service celebrating the birth of our Savior.'
      },
      {
        title: 'Easter Service',
        date: 'Spring',
        description: 'Resurrection Sunday celebration with special music and message.'
      }
    ],
    onlineServicesTitle: 'Online Services',
    onlineServicesDescription: 'Can\'t make it in person? Join us online for live streaming of our Sunday morning worship service. You can also catch up on previous sermons and Bible studies.',
    planYourVisitTitle: 'Plan Your Visit',
    planYourVisitDescription: 'We would love to have you visit us! Here\'s everything you need to know to make your first visit comfortable and welcoming.',
    planYourVisit: [
      {
        title: 'Address',
        description: '223/838 Kannangurichi Main Road, Chinnathirupathi, Salem'
      },
      {
        title: 'Parking',
        description: 'Free parking available on church grounds'
      },
      {
        title: 'Accessibility',
        description: 'Wheelchair accessible entrance and seating'
      },
      {
        title: 'Nursery',
        description: 'Nursery care available for infants and toddlers'
      }
    ]
  }
];

async function addServices() {
  try {
    console.log('🏛️ Adding services and updating services page...');
    
    // First, delete existing servicesPage to avoid conflicts
    try {
      const existingPages = await client.fetch('*[_type == "servicesPage"]');
      for (const page of existingPages) {
        await client.delete(page._id);
        console.log(`🗑️ Deleted existing servicesPage: ${page._id}`);
      }
    } catch (error) {
      console.log('No existing servicesPage to delete');
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of servicesData) {
      try {
        const result = await client.create(doc);
        console.log(`✅ Created ${doc._type}: ${result._id}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to create ${doc._type}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Services setup complete!');
    console.log(`✅ Successfully created: ${successCount} documents`);
    console.log(`❌ Failed to create: ${errorCount} documents`);
    
  } catch (error) {
    console.error('💥 Critical error:', error);
  }
}

addServices();
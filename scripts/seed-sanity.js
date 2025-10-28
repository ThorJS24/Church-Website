const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

const sampleData = [
  // Announcements
  {
    _type: 'announcement',
    title: 'Welcome to Salem Primitive Baptist Church',
    content: 'We are delighted to have you worship with us today. May God bless your time here.',
    priority: 'high',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'announcement', 
    title: 'Sunday Service Times',
    content: 'Join us for Sunday School at 9:30 AM and Worship Service at 10:30 AM every Sunday.',
    priority: 'medium',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  
  // Events
  {
    _type: 'event',
    title: 'Sunday Morning Worship',
    description: 'Join us for our weekly worship service with hymns, prayer, and biblical preaching.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next Sunday
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    location: 'Main Sanctuary',
    isRecurring: true,
    category: 'worship'
  },
  {
    _type: 'event',
    title: 'Bible Study',
    description: 'Midweek Bible study and prayer meeting. All are welcome to join us for fellowship and learning.',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Wednesday
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    location: 'Fellowship Hall',
    isRecurring: true,
    category: 'study'
  },
  
  // Speakers
  {
    _id: 'speaker-pastor-john',
    _type: 'speaker',
    name: 'Pastor John Smith',
    title: 'Senior Pastor',
    bio: 'Pastor John has been serving Salem Primitive Baptist Church for over 15 years.',
    email: 'pastor@salemprimitivebaptist.org'
  },
  
  // Series
  {
    _id: 'series-gospel-of-john',
    _type: 'series',
    title: 'The Gospel of John',
    description: 'A verse-by-verse study through the Gospel of John',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  
  // Sermons
  {
    _type: 'sermon',
    title: 'The Good Shepherd',
    description: 'A message about Jesus as our Good Shepherd from John 10:11-18',
    scripture: 'John 10:11-18',
    date: new Date().toISOString(),
    speaker: {
      _type: 'reference',
      _ref: 'speaker-pastor-john'
    },
    series: {
      _type: 'reference', 
      _ref: 'series-gospel-of-john'
    }
  },
  {
    _type: 'sermon',
    title: 'Walking in Faith',
    description: 'Understanding what it means to walk by faith and not by sight',
    scripture: '2 Corinthians 5:7',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: {
      _type: 'reference',
      _ref: 'speaker-pastor-john'
    }
  },
  {
    _type: 'sermon',
    title: 'The Power of Prayer',
    description: 'Discovering the transformative power of prayer in our daily lives',
    scripture: 'Matthew 6:9-13',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: {
      _type: 'reference',
      _ref: 'speaker-pastor-john'
    }
  },
  
  // Ministries
  {
    _type: 'ministry',
    name: 'Youth Ministry',
    description: 'Engaging young people in faith through Bible study, fellowship, and service.',
    leader: 'Sarah Johnson',
    meetingTime: 'Sundays at 6:00 PM',
    location: 'Youth Room',
    ageGroup: '13-18 years',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Children\'s Ministry',
    description: 'Teaching children about God\'s love through age-appropriate lessons and activities.',
    leader: 'Mary Williams',
    meetingTime: 'Sundays during worship service',
    location: 'Children\'s Wing',
    ageGroup: '3-12 years',
    isActive: true
  },
  
  // Services Page
  {
    _type: 'servicesPage',
    title: 'Our Services',
    description: 'Join us for worship, fellowship, and spiritual growth',
    services: [
      {
        name: 'Sunday Morning Worship',
        time: '10:30 AM',
        description: 'Traditional worship service with hymns, prayer, and biblical preaching'
      },
      {
        name: 'Sunday School',
        time: '9:30 AM', 
        description: 'Bible study for all ages with age-appropriate classes'
      },
      {
        name: 'Wednesday Bible Study',
        time: '7:00 PM',
        description: 'Midweek Bible study and prayer meeting'
      }
    ]
  },
  
  // Site Settings
  {
    _type: 'siteSettings',
    title: 'Salem Primitive Baptist Church',
    description: 'A place where faith, hope, and love come together in Christian fellowship.',
    address: '123 Church Street, Your City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@salemprimitivebaptist.org',
    socialMedia: {
      facebook: 'https://facebook.com/salemprimitivebaptist',
      youtube: 'https://youtube.com/salemprimitivebaptist'
    },
    serviceSchedule: {
      sunday: {
        sundaySchool: '9:30 AM',
        worship: '10:30 AM',
        evening: '6:00 PM'
      },
      wednesday: {
        bibleStudy: '7:00 PM'
      }
    }
  }
];

async function seedData() {
  try {
    console.log('Starting to seed Sanity data...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
    
    for (const doc of sampleData) {
      const result = await client.create(doc);
      console.log(`Created ${doc._type}: ${result._id}`);
    }
    
    console.log('✅ Sanity data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
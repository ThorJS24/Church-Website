const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

const fullChurchData = [
  // Site Settings
  {
    _type: 'siteSettings',
    title: 'Salem Primitive Baptist Church',
    description: 'A faithful congregation serving God and community since 1892. We believe in the sovereignty of God, salvation by grace through faith, and the authority of Scripture.',
    address: '1247 Old Mill Road\nSalem, Virginia 24153',
    phone: '(540) 389-2156',
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
  },

  // Speakers/Pastors
  {
    _id: 'pastor-elder-james-wilson',
    _type: 'speaker',
    name: 'Elder James Wilson',
    title: 'Senior Pastor',
    bio: 'Elder Wilson has faithfully served Salem Primitive Baptist Church for over 20 years. He was called to preach in 1998 and ordained as an elder in 2004. He holds a deep love for expository preaching and pastoral care.',
    email: 'pastor@salemprimitivebaptist.org'
  },
  {
    _id: 'pastor-elder-robert-thompson',
    _type: 'speaker',
    name: 'Elder Robert Thompson',
    title: 'Associate Pastor',
    bio: 'Elder Thompson joined our ministry in 2010 and brings a heart for evangelism and discipleship. He oversees our outreach programs and assists in pastoral duties.',
    email: 'associate@salemprimitivebaptist.org'
  },
  {
    _id: 'deacon-michael-davis',
    _type: 'speaker',
    name: 'Deacon Michael Davis',
    title: 'Deacon',
    bio: 'Deacon Davis has been a faithful member for 15 years and serves in various capacities including teaching and administration.',
    email: 'deacon@salemprimitivebaptist.org'
  },

  // Sermon Series
  {
    _id: 'series-romans-exposition',
    _type: 'series',
    title: 'Romans: The Gospel Unveiled',
    description: 'A comprehensive verse-by-verse exposition of Paul\'s letter to the Romans, exploring the depths of God\'s grace and righteousness.',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    _id: 'series-psalms-comfort',
    _type: 'series',
    title: 'Psalms of Comfort',
    description: 'Finding hope and peace in the Psalms during difficult times.',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  },
  {
    _id: 'series-christian-living',
    _type: 'series',
    title: 'Practical Christian Living',
    description: 'Biblical principles for daily Christian walk and spiritual growth.',
    startDate: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  },

  // Sermons (15 sermons)
  {
    _type: 'sermon',
    title: 'The Righteousness of God Revealed',
    description: 'An exposition of Romans 1:16-17, exploring how the gospel reveals God\'s righteousness and transforms lives.',
    scripture: 'Romans 1:16-17',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' },
    series: { _type: 'reference', _ref: 'series-romans-exposition' }
  },
  {
    _type: 'sermon',
    title: 'All Have Sinned',
    description: 'Understanding the universal nature of sin and our need for salvation as taught in Romans 3:23.',
    scripture: 'Romans 3:21-31',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' },
    series: { _type: 'reference', _ref: 'series-romans-exposition' }
  },
  {
    _type: 'sermon',
    title: 'Justified by Faith',
    description: 'The doctrine of justification by faith alone, as revealed in Romans 5:1-11.',
    scripture: 'Romans 5:1-11',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-robert-thompson' },
    series: { _type: 'reference', _ref: 'series-romans-exposition' }
  },
  {
    _type: 'sermon',
    title: 'Dead to Sin, Alive in Christ',
    description: 'Understanding our new identity in Christ and freedom from sin\'s dominion.',
    scripture: 'Romans 6:1-14',
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' },
    series: { _type: 'reference', _ref: 'series-romans-exposition' }
  },
  {
    _type: 'sermon',
    title: 'The Lord is My Shepherd',
    description: 'Finding comfort and guidance in Psalm 23 during life\'s valleys.',
    scripture: 'Psalm 23',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-robert-thompson' },
    series: { _type: 'reference', _ref: 'series-psalms-comfort' }
  },
  {
    _type: 'sermon',
    title: 'Walking by Faith',
    description: 'Practical steps for living a life of faith in an uncertain world.',
    scripture: '2 Corinthians 5:7',
    date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'deacon-michael-davis' },
    series: { _type: 'reference', _ref: 'series-christian-living' }
  },
  {
    _type: 'sermon',
    title: 'The Power of Prayer',
    description: 'Understanding the privilege and power of prayer in the believer\'s life.',
    scripture: 'Matthew 6:9-13',
    date: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' }
  },
  {
    _type: 'sermon',
    title: 'Love One Another',
    description: 'Christ\'s commandment to love and its practical application in church life.',
    scripture: 'John 13:34-35',
    date: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-robert-thompson' }
  },
  {
    _type: 'sermon',
    title: 'The Great Commission',
    description: 'Our calling to make disciples and share the gospel with all nations.',
    scripture: 'Matthew 28:18-20',
    date: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' }
  },
  {
    _type: 'sermon',
    title: 'Blessed Are the Peacemakers',
    description: 'Understanding the Beatitudes and our call to be peacemakers.',
    scripture: 'Matthew 5:1-12',
    date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'deacon-michael-davis' }
  },
  {
    _type: 'sermon',
    title: 'The Good Shepherd',
    description: 'Jesus as our Good Shepherd who lays down His life for the sheep.',
    scripture: 'John 10:11-18',
    date: new Date(Date.now() - 77 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-robert-thompson' }
  },
  {
    _type: 'sermon',
    title: 'Trusting in God\'s Sovereignty',
    description: 'Finding peace in God\'s perfect plan and timing.',
    scripture: 'Romans 8:28-30',
    date: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' }
  },
  {
    _type: 'sermon',
    title: 'The Armor of God',
    description: 'Spiritual warfare and the believer\'s protection in Christ.',
    scripture: 'Ephesians 6:10-18',
    date: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-robert-thompson' }
  },
  {
    _type: 'sermon',
    title: 'Thanksgiving and Praise',
    description: 'Cultivating a heart of gratitude in all circumstances.',
    scripture: '1 Thessalonians 5:16-18',
    date: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'deacon-michael-davis' }
  },
  {
    _type: 'sermon',
    title: 'The Birth of Our Savior',
    description: 'Celebrating the incarnation and God\'s gift of salvation.',
    scripture: 'Luke 2:1-20',
    date: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
    speaker: { _type: 'reference', _ref: 'pastor-elder-james-wilson' }
  },

  // Events (10 events)
  {
    _type: 'event',
    title: 'Sunday Morning Worship',
    description: 'Join us for our weekly worship service featuring traditional hymns, prayer, and expository preaching.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Main Sanctuary',
    isRecurring: true,
    category: 'worship'
  },
  {
    _type: 'event',
    title: 'Wednesday Bible Study',
    description: 'Midweek Bible study and prayer meeting. Currently studying the book of Philippians.',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    location: 'Fellowship Hall',
    isRecurring: true,
    category: 'study'
  },
  {
    _type: 'event',
    title: 'Annual Church Homecoming',
    description: 'A special day of fellowship, dinner on the grounds, and celebrating God\'s faithfulness.',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    location: 'Church Grounds',
    isRecurring: false,
    category: 'fellowship'
  },
  {
    _type: 'event',
    title: 'Youth Bible Study',
    description: 'Bible study specifically designed for teenagers and young adults.',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    location: 'Youth Room',
    isRecurring: true,
    category: 'youth'
  },
  {
    _type: 'event',
    title: 'Ladies Fellowship Meeting',
    description: 'Monthly gathering for the ladies of the church for fellowship and Bible study.',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Fellowship Hall',
    isRecurring: true,
    category: 'fellowship'
  },
  {
    _type: 'event',
    title: 'Men\'s Prayer Breakfast',
    description: 'Monthly men\'s gathering for prayer, fellowship, and encouragement.',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    location: 'Fellowship Hall',
    isRecurring: true,
    category: 'fellowship'
  },
  {
    _type: 'event',
    title: 'Vacation Bible School',
    description: 'A week-long program for children featuring Bible stories, crafts, games, and snacks.',
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Church Campus',
    isRecurring: false,
    category: 'children'
  },
  {
    _type: 'event',
    title: 'Church Business Meeting',
    description: 'Quarterly business meeting to discuss church matters and ministry updates.',
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    location: 'Main Sanctuary',
    isRecurring: true,
    category: 'business'
  },
  {
    _type: 'event',
    title: 'Community Outreach Day',
    description: 'Serving our local community through various outreach activities and service projects.',
    startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Various Locations',
    isRecurring: false,
    category: 'outreach'
  },
  {
    _type: 'event',
    title: 'Christmas Cantata',
    description: 'Special Christmas musical presentation by our church choir.',
    startDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    location: 'Main Sanctuary',
    isRecurring: false,
    category: 'special'
  },

  // Ministries (8 ministries)
  {
    _type: 'ministry',
    name: 'Youth Ministry',
    description: 'Engaging young people ages 13-18 in Bible study, fellowship, and service opportunities. We meet every Friday evening for Bible study and plan monthly activities.',
    leader: 'Sarah Johnson',
    meetingTime: 'Fridays at 7:00 PM',
    location: 'Youth Room',
    ageGroup: '13-18 years',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Children\'s Ministry',
    description: 'Teaching children ages 3-12 about God\'s love through age-appropriate lessons, crafts, and activities during Sunday worship.',
    leader: 'Mary Williams',
    meetingTime: 'Sundays during worship service',
    location: 'Children\'s Wing',
    ageGroup: '3-12 years',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Ladies Auxiliary',
    description: 'A ministry for women of all ages focusing on Bible study, fellowship, and service projects. We support missions and community outreach.',
    leader: 'Betty Thompson',
    meetingTime: 'Second Saturday of each month at 10:00 AM',
    location: 'Fellowship Hall',
    ageGroup: 'Adult women',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Men\'s Fellowship',
    description: 'Monthly gatherings for men to study God\'s Word, pray together, and encourage one another in Christian living.',
    leader: 'Robert Davis',
    meetingTime: 'Third Saturday of each month at 8:00 AM',
    location: 'Fellowship Hall',
    ageGroup: 'Adult men',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Senior Saints',
    description: 'A ministry dedicated to our senior members, providing fellowship, encouragement, and special activities for those 65 and older.',
    leader: 'Dorothy Wilson',
    meetingTime: 'First Thursday of each month at 2:00 PM',
    location: 'Fellowship Hall',
    ageGroup: '65+ years',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Music Ministry',
    description: 'Our church choir and musicians who lead worship through traditional hymns and special music presentations.',
    leader: 'James Mitchell',
    meetingTime: 'Thursdays at 7:00 PM (Choir Practice)',
    location: 'Main Sanctuary',
    ageGroup: 'All ages',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Missions Committee',
    description: 'Supporting local and international missions through prayer, financial support, and mission trips.',
    leader: 'Patricia Brown',
    meetingTime: 'Monthly planning meetings',
    location: 'Conference Room',
    ageGroup: 'All ages',
    isActive: true
  },
  {
    _type: 'ministry',
    name: 'Hospitality Ministry',
    description: 'Welcoming visitors, organizing fellowship meals, and ensuring everyone feels at home in our church family.',
    leader: 'Linda Anderson',
    meetingTime: 'As needed for events',
    location: 'Fellowship Hall',
    ageGroup: 'All ages',
    isActive: true
  },

  // Announcements (5 announcements)
  {
    _type: 'announcement',
    title: 'Welcome to Salem Primitive Baptist Church',
    content: 'We are delighted to have you worship with us today. Whether you are visiting for the first time or have been part of our church family for years, we pray that God will bless your time here and speak to your heart through His Word.',
    priority: 'high',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'announcement',
    title: 'Sunday Service Schedule',
    content: 'Join us every Sunday for Sunday School at 9:30 AM and Morning Worship at 10:30 AM. Evening service begins at 6:00 PM. Wednesday Bible Study and Prayer Meeting starts at 7:00 PM.',
    priority: 'high',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'announcement',
    title: 'Annual Homecoming - Save the Date',
    content: 'Mark your calendars for our Annual Church Homecoming next month! We will have special singing, dinner on the grounds, and a time of fellowship celebrating God\'s faithfulness to our church.',
    priority: 'medium',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'announcement',
    title: 'Prayer Request Submissions',
    content: 'If you have a prayer request, please submit it through our website or speak with one of our pastors. We believe in the power of prayer and want to lift up your needs before the Lord.',
    priority: 'medium',
    isActive: true,
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'announcement',
    title: 'Volunteer Opportunities',
    content: 'There are many ways to serve in our church family. From teaching Sunday School to helping with hospitality, we have opportunities for everyone to use their gifts for God\'s glory.',
    priority: 'low',
    isActive: true,
    publishedAt: new Date().toISOString()
  },

  // Services Page
  {
    _type: 'servicesPage',
    title: 'Our Worship Services',
    description: 'We gather regularly to worship God, study His Word, and fellowship together as believers.',
    services: [
      {
        name: 'Sunday Morning Worship',
        time: '10:30 AM',
        description: 'Our main worship service featuring congregational singing of traditional hymns, prayer, and expository preaching from God\'s Word.'
      },
      {
        name: 'Sunday School',
        time: '9:30 AM',
        description: 'Bible study classes for all ages with dedicated teachers providing age-appropriate lessons from Scripture.'
      },
      {
        name: 'Sunday Evening Service',
        time: '6:00 PM',
        description: 'A more intimate worship service with singing, prayer, and biblical teaching.'
      },
      {
        name: 'Wednesday Bible Study',
        time: '7:00 PM',
        description: 'Midweek Bible study and prayer meeting where we dive deeper into God\'s Word and pray for one another.'
      }
    ]
  }
];

async function seedFullData() {
  try {
    console.log('🏛️ Starting comprehensive Sanity data seeding...');
    console.log(`📊 Seeding ${fullChurchData.length} documents`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of fullChurchData) {
      try {
        const result = await client.create(doc);
        console.log(`✅ Created ${doc._type}: ${result._id}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to create ${doc._type}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Sanity seeding complete!');
    console.log(`✅ Successfully created: ${successCount} documents`);
    console.log(`❌ Failed to create: ${errorCount} documents`);
    console.log('\n📋 Content Summary:');
    console.log('- 15 Sermons with 3 different speakers');
    console.log('- 10 Events (recurring and special)');
    console.log('- 8 Ministries covering all age groups');
    console.log('- 5 Church announcements');
    console.log('- 3 Sermon series');
    console.log('- 3 Speakers/pastors');
    console.log('- Complete site settings');
    console.log('- Services page content');
    
  } catch (error) {
    console.error('💥 Critical error during seeding:', error);
  }
}

seedFullData();
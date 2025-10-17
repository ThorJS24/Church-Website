const { MongoClient, ObjectId } = require('mongodb')

const uri = 'mongodb://localhost:27017'
const dbName = 'grace_church'

async function seedDatabase() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(dbName)

    // Clear existing data
    await db.collection('events').deleteMany({})
    await db.collection('sermons').deleteMany({})
    await db.collection('prayerrequests').deleteMany({})
    await db.collection('speakers').deleteMany({})
    await db.collection('series').deleteMany({})

    // Create a speaker
    const speakerResult = await db.collection('speakers').insertOne({ name: 'Pastor Michael Johnson' })
    const speakerId = speakerResult.insertedId

    // Create a series
    const seriesResult = await db.collection('series').insertOne({ title: 'Faith Journey', description: 'A series on walking by faith.' })
    const seriesId = seriesResult.insertedId

    const sampleData = {
      events: [
        {
          title: 'Sunday Morning Worship',
          description: 'Join us for our weekly worship service with inspiring music and message.',
          eventDate: new Date('2024-02-04'),
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          location: 'Main Sanctuary',
          category: 'worship',
          featured: true,
          maxAttendees: 200,
          registeredAttendees: [],
          createdBy: new ObjectId('507f1f77bcf86cd799439011')
        },
        {
          title: 'Youth Group Meeting',
          description: 'Weekly youth gathering for fellowship, games, and Bible study.',
          eventDate: new Date('2024-02-07'),
          startTime: '7:00 PM',
          endTime: '9:00 PM',
          location: 'Youth Center',
          category: 'youth',
          featured: false,
          maxAttendees: 50,
          registeredAttendees: [],
          createdBy: new ObjectId('507f1f77bcf86cd799439011')
        }
      ],
      sermons: [
        {
          title: 'Walking in Faith',
          description: 'Discover what it means to walk by faith and not by sight in our daily lives.',
          speaker: speakerId,
          series: seriesId,
          scripture: 'Hebrews 11:1',
          date: new Date('2024-01-21'),
          duration: '35 min',
          videoUrl: 'https://example.com/video1',
          audioUrl: 'https://example.com/audio1',
          featured: true,
          views: 150,
          likes: []
        }
      ],
      prayerRequests: [
        {
          title: 'Guidance in New Job',
          description: 'Please pray for wisdom as I start my new position.',
          category: 'guidance',
          isPrivate: false,
          isAnonymous: false,
          authorName: 'John D.',
          prayedBy: [],
          status: 'active'
        }
      ]
    }
    
    await db.collection('events').insertMany(sampleData.events)
    await db.collection('sermons').insertMany(sampleData.sermons)
    await db.collection('prayerrequests').insertMany(sampleData.prayerRequests)
    
    console.log('Database seeded successfully!')
    
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
  }
}

seedDatabase()
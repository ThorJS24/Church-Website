import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['worship', 'ministry', 'outreach', 'social', 'education', 'youth', 'children'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  },
  maxAttendees: {
    type: Number
  },
  registeredAttendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
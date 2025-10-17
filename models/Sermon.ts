import mongoose from 'mongoose'

const SermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Speaker',
    required: true
  },
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
  },
  scripture: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: String
  },
  videoUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  notesUrl: {
    type: String
  },
  thumbnail: {
    type: String
  },
  tags: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

export default mongoose.models.Sermon || mongoose.model('Sermon', SermonSchema)
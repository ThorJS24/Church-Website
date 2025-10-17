import mongoose from 'mongoose'

const PrayerRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['healing', 'guidance', 'thanksgiving', 'family', 'work', 'general'],
    default: 'general'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  prayedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prayedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'answered', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
})

export default mongoose.models.PrayerRequest || mongoose.model('PrayerRequest', PrayerRequestSchema)
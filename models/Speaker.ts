import mongoose from 'mongoose'

const SpeakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
})

export default mongoose.models.Speaker || mongoose.model('Speaker', SpeakerSchema)

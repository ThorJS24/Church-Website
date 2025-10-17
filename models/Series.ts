import mongoose from 'mongoose'

const SeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
})

export default mongoose.models.Series || mongoose.model('Series', SeriesSchema)

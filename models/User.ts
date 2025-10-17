import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: String,
  photoURL: String,
  password: {
    type: String,
    required: true,
  },
  phone: String,
  address: String,
  dateOfBirth: Date,
  interests: [String],
  role: {
    type: String,
    enum: ['visitor', 'member', 'volunteer', 'staff', 'pastor', 'admin'],
    default: 'visitor',
  },
  membershipStatus: {
    type: String,
    enum: ['member', 'visitor', 'regular_attendee'],
    default: 'visitor',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
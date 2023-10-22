import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    email: { type: String, required: true, max: 50, unique: true },
    password: { type: String, required: true, min: 5 },
    companyName: String,
    province: String,
    district: String,
    ward: String,
    address: String,
    phoneNumber: String,
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    refreshToken: String,
    resetToken: String,
  },
  { timestamps: true },
)

const User = mongoose.model('User', userSchema)

export default User

import mongoose from 'mongoose'

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    starPoint: Number,
    comment: String,
  },
  { timestamps: true },
)

const Rating = mongoose.model('Rating', RatingSchema)

export default Rating

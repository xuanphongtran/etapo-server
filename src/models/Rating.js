import mongoose from 'mongoose'

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    startPoint: Number,
    comment: String,
    isDel: Boolean,
  },
  { timestamps: true },
)

const Rating = mongoose.model('Rating', RatingSchema)

export default Rating

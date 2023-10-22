import mongoose from 'mongoose'

const wishlistProductsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    products: [{ type: Object }],
  },
  {
    timestamps: true,
  },
)
const WishlistProducts = mongoose.model('WishlistProduct', wishlistProductsSchema)

export default WishlistProducts

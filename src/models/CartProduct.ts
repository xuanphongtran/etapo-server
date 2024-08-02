import mongoose from 'mongoose'

const cartProductsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    products: [{ type: Object }],
  },
  {
    timestamps: true,
  },
)
const CartProducts = mongoose.model('CartProduct', cartProductsSchema)

export default CartProducts

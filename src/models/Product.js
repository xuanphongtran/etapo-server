import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    description: String,
    images: [{ type: String }],
    category: String,
    rating: Number,
    discount: Number,
    gender: Number,
    tag: String,
    delFlag: Boolean,
<<<<<<< HEAD
    properties: [{ type: Object }],
=======
    properties: { type: Object },
>>>>>>> 1404ca947dbef0b3e2b96da6340c691d26a8cd2f
  },
  { timestamps: true },
)

const Product = mongoose.model('Product', productSchema)

export default Product

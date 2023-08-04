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
    properties: { type: Object },
  },
  { timestamps: true },
)

const Product = mongoose.model('Product', productSchema)

export default Product

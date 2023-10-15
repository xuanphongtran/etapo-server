import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: 'Category' },
    image: String,
    level: Number,
  },
  {
    timestamps: true,
  },
)
const Category = mongoose.model('Category', categorySchema)

export default Category

import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: [{ type: Object }],
  },
  {
    timestamps: true,
  },
)
const Category = mongoose.model('Category', categorySchema)

export default Category

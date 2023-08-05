import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // parent: { type: mongoose.Types.ObjectId, ref: 'Category' },
<<<<<<< HEAD
    properties: [{ type: Object }],
=======
    properties: [{ type: String }],
>>>>>>> 1404ca947dbef0b3e2b96da6340c691d26a8cd2f
  },
  {
    timestamps: true,
  },
)
const Category = mongoose.model('Category', categorySchema)

export default Category

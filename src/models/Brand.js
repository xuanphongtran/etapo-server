import mongoose from 'mongoose'

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // parent: { type: mongoose.Types.ObjectId, ref: 'Category' },
    // properties: [{ type: Object }],
  },
  {
    timestamps: true,
  },
)
const Brand = mongoose.model('Brand', brandSchema)

export default Brand

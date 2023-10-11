import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: [{ type: String }],
  },
  { timestamps: true },
)

const Property = mongoose.model('Property', propertySchema)

export default Property

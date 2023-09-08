import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  optionsL: [{ type: String }],
})

const Property = mongoose.model('Property', propertySchema)

export default Property

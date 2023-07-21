import mongoose from 'mongoose'

const orderStatSchema = new mongoose.Schema(
  {
    userId: String,
    cost: String,
    line_items: Object,
    information: {
      name: String,
      email: String,
      city: String,
      postalCode: String,
      streetAddress: String,
      country: String,
    },
    paid: Boolean,
    status: String,
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderStatSchema)

export default Order

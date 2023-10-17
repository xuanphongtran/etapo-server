import mongoose from 'mongoose'

const orderStatSchema = new mongoose.Schema(
  {
    userId: String,
    cost: Number,
    paymentId: String,
    products: [{ type: Object }],
    fullName: String,
    email: String,
    companyName: String,
    province: String,
    district: String,
    ward: String,
    address: String,
    phoneNumber: String,
    paid: Boolean,
    status: String,
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderStatSchema)

export default Order

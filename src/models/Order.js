import mongoose from 'mongoose'

const orderStatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
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
    status: Number,
    delFlag: Number,
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderStatSchema)

export default Order

import mongoose from 'mongoose'

const transactionStatSchema = new mongoose.Schema(
  {
    userId: String,
    cost: String,
    products: {
      type: [mongoose.Types.ObjectId],
      of: Number,
    },
  },
  { timestamps: true },
)

const Transaction = mongoose.model('Transaction', transactionStatSchema)

export default Transaction

import mongoose from 'mongoose'
import Order from '../models/Order.js'
import OverallStat from '../models/OverallStat.js'
import jwt from 'jsonwebtoken'

export const getSales = async (req, res) => {
  try {
    const overallStats = await OverallStat.find()

    res.status(200).json(overallStats[0])
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const createOrder = async (req, res) => {
  try {
    let userId = null
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const parserTokens = req.headers.authorization.split('Bearer ')
      const token = parserTokens[1]
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      userId = new mongoose.Types.ObjectId(decoded._id)
    }
    const orderData = req.body
    const { products } = req.body
    const parsedData = products.map((item) => {
      return {
        cost: item.cost,
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
      }
    })
    const newOrder = new Order({ ...orderData, userId, products: parsedData })
    await newOrder.save()

    res.status(200).json(newOrder)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const updateOrder = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body
    const id = new mongoose.Types.ObjectId(orderId)
    // Update user data with orderId
    await Order.findByIdAndUpdate(id, { paymentId, paid: true })

    res.status(200).send('Cập nhập đơn hàng  thành công')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}

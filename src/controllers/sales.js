import mongoose from 'mongoose'
import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
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
export const getOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = '' } = req.query

    const generalSort = () => {
      const sortParsed = JSON.parse(sort)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1,
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const orders = await Order.find({
      $and: [
        { $or: [{ userId: { $regex: new RegExp(search, 'i') } }] },
        { delFlag: 0 }, // Add this condition
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const ordersWithUserName = await Promise.all(
      orders.map(async (order) => {
        const userName = await getUserNameById(order.userId)

        const productsWithProductName = await Promise.all(
          order.products.map(async (product) => {
            const productName = await getProductNameById(product.productId)
            return {
              ...product,
              name: productName,
            }
          }),
        )
        const provinceName = await getProvinceNameById(order.province)
        const districtName = await getDistrictNameById(order.district)
        const wardName = await getWardNameById(order.ward)
        return {
          ...order._doc,
          userId: userName,
          province: provinceName,
          district: districtName,
          ward: wardName,
          products: productsWithProductName,
        }
      }),
    )
    const total = await Order.countDocuments({ name: { $regex: search, $options: 'i' } })

    res.status(200).json({ orders: ordersWithUserName, total })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const getOrdersById = async (req, res) => {
  const orderId = req.params.id
  try {
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(401).json({ message: 'Không tìm thấy đơn hàng' })
    }

    const userName = await getUserNameById(order.userId)
    const productsWithProductName = await Promise.all(
      order.products.map(async (product) => {
        const productName = await getProductNameById(product.productId)
        return {
          ...product,
          name: productName,
        }
      }),
    )
    const provinceName = await getProvinceNameById(order.province)
    const districtName = await getDistrictNameById(order.district)
    const wardName = await getWardNameById(order.ward)
    res.status(200).json({
      ...order._doc,
      userId: userName,
      province: provinceName,
      district: districtName,
      ward: wardName,
      products: productsWithProductName,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Không tìm thấy đơn hàng' })
  }
}
const getUserNameById = async (userId) => {
  const user = await User.findById(userId)
  return user ? user.name : null
}
const getProductNameById = async (productId) => {
  const product = await Product.findById(productId)
  return product ? product.name : null
}
const getProvinceNameById = async (provinceId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}/?q==Y`)
    const provinceData = await response.json()
    return provinceData ? provinceData.name : null
  } catch (error) {
    console.error('Error fetching province data:', error)
    return null
  }
}
const getDistrictNameById = async (districtId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}/?q==Y`)
    const districtData = await response.json()
    return districtData ? districtData.name : null
  } catch (error) {
    console.error('Error fetching dictrict data:', error)
    return null
  }
}
const getWardNameById = async (wardId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/w/${wardId}/?q==Y`)
    const wardData = await response.json()
    return wardData ? wardData.name : null
  } catch (error) {
    console.error('Error fetching ward data:', error)
    return null
  }
}

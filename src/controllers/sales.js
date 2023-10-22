import mongoose from 'mongoose'
import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import OverallStat from '../models/OverallStat.js'
import ProductStat from '../models/ProductStat.js'
import nodemailer from 'nodemailer'
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
    sendSuccessEmail(orderData.email, newOrder._id)
    for (const item of parsedData) {
      updateProductStat(item, newOrder)
      updateOverallStat(item, newOrder)
    }

    res.status(200).json(newOrder)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
const sendSuccessEmail = (email, orderId) => {
  const mailOptions = {
    from: 'Ziggy',
    to: email,
    subject: 'Đặt Hàng Thành Công',
    text: `Bạn đã đặt hàng thành công \n Mã đơn hàng của bạn ${orderId}`,
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
const updateProductStat = async (item, newOrder) => {
  const productStat = await ProductStat.findOne({ productId: item.productId })

  if (productStat) {
    productStat.quantity -= item.quantity
    const orderDate = new Date(newOrder.createdAt)
    productStat.year = orderDate.getFullYear()
    const month = orderDate.getMonth() + 1 // Note: Month is zero-indexed
    const date = orderDate.getDate()

    // Update or add monthlyData based on the order's month
    const monthlyData = productStat.monthtlyData.find((data) => data.month === month.toString())
    if (monthlyData) {
      monthlyData.totalSales += newOrder.cost // Assuming order.total represents sales
      monthlyData.totalUnits += item.quantity
    } else {
      productStat.monthtlyData.push({
        month: month.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity,
      })
    }

    // Update or set dailyData based on the order's date
    const dailyData = productStat.dailyData
    if (dailyData.date === date.toString()) {
      dailyData.totalSales += newOrder.cost // Assuming order.total represents sales
      dailyData.totalUnits += item.quantity
    } else {
      productStat.dailyData.push({
        date: date.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity,
      })
    }

    productStat.updatedAt = newOrder.createdAt
    // Save the updated ProductStat
    await productStat.save()
  }
}
const updateOverallStat = async (item, newOrder) => {
  const orderDate = new Date(newOrder.createdAt)
  const stat = await OverallStat.findOne({ year: orderDate.getFullYear() })
  if (stat) {
    stat.yearlySalesTotal += newOrder.cost
    stat.yearlyTotalSoldUnits += item.quantity
    const month = orderDate.getMonth() + 1 // Note: Month is zero-indexed
    const date = orderDate.getDate()
    // Update or add monthlyData based on the order's month
    const monthlyData = stat.monthlyData.find((data) => data.month === month.toString())
    if (monthlyData) {
      monthlyData.totalSales += newOrder.cost // Assuming order.total represents sales
      monthlyData.totalUnits += item.quantity
    } else {
      stat.monthlyData.push({
        monthName: `Tháng ${month.toString()}`,
        month: month.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity,
      })
    }
    // Update or set dailyData based on the order's date
    const dailyData = stat.dailyData
    if (dailyData.date === date.toString()) {
      dailyData.totalSales += newOrder.cost // Assuming order.total represents sales
      dailyData.totalUnits += item.quantity
    } else {
      stat.dailyData.push({
        date: date.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity,
      })
      stat.updatedAt = orderDate
    }
    // Save the updated OverallStat
    await stat.save()
  } else {
    const month = orderDate.getMonth() + 1 // Note: Month is zero-indexed
    const date = orderDate.getDate()
    const newOverallstats = new OverallStat({
      totalCustomers: 0,
      year: orderDate.getFullYear(),
      yearlySalesTotal: newOrder.cost,
      yearlyTotalSoldUnits: item.quantity,
      monthlyData: [
        {
          monthName: `Tháng ${month.toString()}`,
          month: month.toString(),
          totalSales: newOrder.cost,
          totalUnits: item.quantity,
        },
      ],
      dailyData: [
        {
          date: date.toString(),
          totalSales: newOrder.cost,
          totalUnits: item.quantity,
        },
      ],
      salesByCategory: {},
      createdAt: orderDate,
    })
    await newOverallstats.save()
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
    const { page = 1, pageSize = 20, sort = null, search = '', status = 1 } = req.query

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
        { delFlag: 0 },
        { status: status }, // Add this condition
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
    const total = await Order.countDocuments()

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
export const acceptOrder = async (req, res) => {
  try {
    const { id, status } = req.body

    const update = await Order.findByIdAndUpdate(id, {
      status,
    })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any Order with ID ${id}` })
    }
    const updatedOrder = await Order.findById(id)
    res.status(200).json({ message: 'Success', updatedOrder })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.body

    const update = await Order.findByIdAndUpdate(id, {
      delFlag: 1,
    })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any Order with ID ${id}` })
    }
    const updatedOrder = await Order.findById(id)
    res.status(200).json({ message: 'Success', updatedOrder })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const getUserNameById = async (userId) => {
  const user = await User.findById(userId)
  return user ? user.name : null
}
export const getProductNameById = async (productId) => {
  const product = await Product.findById(productId)
  return product ? product.name : null
}
export const getProvinceNameById = async (provinceId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}/?q==Y`)
    const provinceData = await response.json()
    return provinceData ? provinceData.name : null
  } catch (error) {
    console.error('Error fetching province data:', error)
    return null
  }
}
export const getDistrictNameById = async (districtId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}/?q==Y`)
    const districtData = await response.json()
    return districtData ? districtData.name : null
  } catch (error) {
    console.error('Error fetching dictrict data:', error)
    return null
  }
}
export const getWardNameById = async (wardId) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/w/${wardId}/?q==Y`)
    const wardData = await response.json()
    return wardData ? wardData.name : null
  } catch (error) {
    console.error('Error fetching ward data:', error)
    return null
  }
}

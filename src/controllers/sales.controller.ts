import { ACCESS_TOKEN_SECRET } from '@/constants/env'
import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import Order from '@/models/Order'
import OverallStat from '@/models/OverallStat'
import Product from '@/models/Product'
import ProductStat from '@/models/ProductStat'
import User from '@/models/User'
import { Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'

export const getSales = async (req: Request, res: Response) => {
  try {
    const overallStats = await OverallStat.find()

    res.status(HttpStatusCode.Ok).json(overallStats[0])
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    let userId = null
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const parserTokens = req.headers.authorization.split('Bearer ')
      const token = parserTokens[1]
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
      userId = new mongoose.Types.ObjectId((decoded as JwtPayload)._id)
    }
    const orderData = req.body
    const { products } = req.body
    const parsedData = products.map((item: any) => {
      return {
        cost: item.cost,
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity
      }
    })

    const newOrder: any = new Order({ ...orderData, userId, products: parsedData })
    await newOrder.save()
    sendSuccessEmail(orderData.email, newOrder._id)
    for (const item of parsedData) {
      updateProductStat(item, newOrder)
      updateOverallStat(item, newOrder)
    }

    res.status(HttpStatusCode.Ok).json(newOrder)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

const sendSuccessEmail = (email: string, orderId: string) => {
  const mailOptions = {
    from: 'Ziggy',
    to: email,
    subject: 'Đặt Hàng Thành Công',
    text: `Bạn đã đặt hàng thành công \n Mã đơn hàng của bạn ${orderId}`
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

const updateProductStat = async (item: any, newOrder: any) => {
  const productStat: any = await ProductStat.findOne({ productId: item.productId })

  if (productStat) {
    productStat.quantity -= item.quantity
    const orderDate = new Date(newOrder.createdAt)
    productStat.year = orderDate.getFullYear()
    const month = orderDate.getMonth() + 1 // Note: Month is zero-indexed
    const date = orderDate.getDate()

    // Update or add monthlyData based on the order's month
    const monthlyData = productStat.monthlyData.find((data: any) => data.month === month.toString())
    if (monthlyData) {
      monthlyData.totalSales += newOrder.cost // Assuming order.total represents sales
      monthlyData.totalUnits += item.quantity
    } else {
      productStat.monthtlyData.push({
        month: month.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity
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
        totalUnits: item.quantity
      })
    }

    productStat.updatedAt = newOrder.createdAt
    // Save the updated ProductStat
    await productStat.save()
  }
}

const updateOverallStat = async (item: any, newOrder: any) => {
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
        totalUnits: item.quantity
      })
    }
    // Update or set dailyData based on the order's date
    const dailyData: any = stat.dailyData
    if (dailyData.date === date.toString()) {
      dailyData.totalSales += newOrder.cost // Assuming order.total represents sales
      dailyData.totalUnits += item.quantity
    } else {
      stat.dailyData.push({
        date: date.toString(),
        totalSales: newOrder.cost,
        totalUnits: item.quantity
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
          totalUnits: item.quantity
        }
      ],
      dailyData: [
        {
          date: date.toString(),
          totalSales: newOrder.cost,
          totalUnits: item.quantity
        }
      ],
      salesByCategory: {},
      createdAt: orderDate
    })
    await newOverallstats.save()
  }
}

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId } = req.body
    const id = new mongoose.Types.ObjectId(orderId)
    // Update user data with orderId
    await Order.findByIdAndUpdate(id, { paymentId, paid: true })

    res.status(HttpStatusCode.Ok).send('Cập nhập đơn hàng  thành công')
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).send('Internal Server Error')
  }
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = '', status = 1 } = req.query

    const generalSort = () => {
      const sortParsed = JSON.parse(String(sort))
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const orders = await Order.find({
      $and: [
        { delFlag: 0 },
        { status: status } // Add this condition
      ]
    })
      .sort(sortFormatted as any)
      .skip((page as number) * (pageSize as number))
      .limit(pageSize as number)

    const ordersWithUserName = await Promise.all(
      orders.map(async (order: any) => {
        const userName = await getUserNameById(order.userId)

        const productsWithProductName = await Promise.all(
          order.products.map(async (product: any) => {
            const productName = await getProductNameById(product.productId)
            return {
              ...product,
              name: productName
            }
          })
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
          products: productsWithProductName
        }
      })
    )
    const total = await Order.countDocuments()

    res.status(HttpStatusCode.Ok).json({ orders: ordersWithUserName, total })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const getOrdersById = async (req: Request, res: Response) => {
  const orderId = req.params.id
  try {
    const order: any = await Order.findById(orderId)

    if (!order) {
      return res.status(401).json({ message: 'Không tìm thấy đơn hàng' })
    }

    const userName = await getUserNameById(order.userId)
    const productsWithProductName = await Promise.all(
      order.products.map(async (product: any) => {
        const productName = await getProductNameById(product.productId)
        return {
          ...product,
          name: productName
        }
      })
    )
    const provinceName = await getProvinceNameById(order.province)
    const districtName = await getDistrictNameById(order.district)
    const wardName = await getWardNameById(order.ward)
    res.status(HttpStatusCode.Ok).json({
      ...order._doc,
      userId: userName,
      province: provinceName,
      district: districtName,
      ward: wardName,
      products: productsWithProductName
    })
  } catch (error) {
    console.error(error)
    res.status(HttpStatusCode.InternalServerError).json({ message: 'Không tìm thấy đơn hàng' })
  }
}

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body

    const update = await Order.findByIdAndUpdate(id, {
      status
    })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any Order with ID ${id}` })
    }
    const updatedOrder = await Order.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedOrder })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.body

    const update = await Order.findByIdAndUpdate(id, {
      delFlag: 1
    })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any Order with ID ${id}` })
    }
    const updatedOrder = await Order.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedOrder })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const getUserNameById = async (userId: any) => {
  const user = await User.findById(userId)
  return user ? user.name : null
}

export const getProductNameById = async (productId: any) => {
  const product = await Product.findById(productId)
  return product ? product.name : null
}

export const getProvinceNameById = async (provinceId: any) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}/?q==Y`)
    const provinceData = await response.json()
    return provinceData ? provinceData.name : null
  } catch (error) {
    console.error('Error fetching province data:', error)
    return null
  }
}

export const getDistrictNameById = async (districtId: any) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}/?q==Y`)
    const districtData = await response.json()
    return districtData ? districtData.name : null
  } catch (error) {
    console.error('Error fetching dictrict data:', error)
    return null
  }
}

export const getWardNameById = async (wardId: any) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/w/${wardId}/?q==Y`)
    const wardData = await response.json()
    return wardData ? wardData.name : null
  } catch (error) {
    console.error('Error fetching ward data:', error)
    return null
  }
}

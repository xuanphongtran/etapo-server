import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import Order from '@/models/Order'
import OverallStat from '@/models/OverallStat'
import User from '@/models/User'
import { Request, Response } from 'express'
import { getUserNameById } from './sales.controller'

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    res.status(HttpStatusCode.Ok).json(user)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // hardcoded values
    const currentMonth = '12'
    const currentYear = 2021
    const currentDay = '2021-11-15'

    /* Recent orders */
    const orders = await Order.find().limit(50).sort({ createdOn: -1 })
    const ordersWithUserName = await Promise.all(
      orders.map(async (order: any) => {
        const userName = await getUserNameById(order.userId)

        return {
          ...order._doc,
          userId: userName
        }
      })
    )
    /* Overall Stats */
    const overallStat = await OverallStat.find({ year: currentYear })

    const { totalCustomers, yearlyTotalSoldUnits, yearlySalesTotal, monthlyData, salesByCategory } = overallStat[0]

    const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
      return month === currentMonth
    })

    const todayStats = overallStat[0].dailyData.find(({ date }) => {
      return date === currentDay
    })

    res.status(HttpStatusCode.Ok).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      orders: ordersWithUserName
    })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

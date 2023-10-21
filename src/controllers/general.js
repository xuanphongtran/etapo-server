import User from '../models/User.js'
import Order from '../models/Order.js'
import OverallStat from '../models/OverallStat.js'
import { getUserNameById } from './sales.js'

export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getDashboardStats = async (req, res) => {
  try {
    // hardcoded values
    const currentMonth = '12'
    const currentYear = 2021
    const currentDay = '2021-11-15'

    /* Recent orders */
    const orders = await Order.find().limit(50).sort({ createdOn: -1 })
    const ordersWithUserName = await Promise.all(
      orders.map(async (order) => {
        const userName = await getUserNameById(order.userId)

        return {
          ...order._doc,
          userId: userName,
        }
      }),
    )
    /* Overall Stats */
    const overallStat = await OverallStat.find({ year: currentYear })

    const { totalCustomers, yearlyTotalSoldUnits, yearlySalesTotal, monthlyData, salesByCategory } =
      overallStat[0]

    const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
      return month === currentMonth
    })

    const todayStats = overallStat[0].dailyData.find(({ date }) => {
      return date === currentDay
    })

    res.status(200).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      orders: ordersWithUserName,
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

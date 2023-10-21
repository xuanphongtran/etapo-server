import User from '../models/User.js'
import Order from '../models/Order.js'
import { getDistrictNameById, getProvinceNameById, getWardNameById } from './sales.js'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    const userWithName = await Promise.all(
      users.map(async (user) => {
        const provinceName = await getProvinceNameById(user.province)
        const districtName = await getDistrictNameById(user.district)
        const wardName = await getWardNameById(user.ward)
        const userOrders = await Order.find({ userId: user._id })
        return {
          ...user._doc,
          province: provinceName,
          district: districtName,
          ward: wardName,
          orders: userOrders?.length,
        }
      }),
    )
    res.status(200).json(userWithName)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

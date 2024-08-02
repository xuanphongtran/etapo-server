import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import Order from '@/models/Order'
import User from '@/models/User'
import { Request, Response } from 'express'
import { getDistrictNameById, getProvinceNameById, getWardNameById } from './sales.controller'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    const userWithName = await Promise.all(
      users.map(async (user: any) => {
        const provinceName = await getProvinceNameById(user.province)
        const districtName = await getDistrictNameById(user.district)
        const wardName = await getWardNameById(user.ward)
        const userOrders = await Order.find({ userId: user._id })
        return {
          ...user._doc,
          province: provinceName,
          district: districtName,
          ward: wardName,
          orders: userOrders?.length
        }
      })
    )
    res.status(HttpStatusCode.Ok).json(userWithName)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

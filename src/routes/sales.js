import express from 'express'
import {
  createOrder,
  getOrders,
  getOrdersById,
  getSales,
  updateOrder,
} from '../controllers/sales.js'

const router = express.Router()

router.get('/sales', getSales)
router.post('/createOrder', createOrder)
router.put('/updateOrder', updateOrder)
router.get('/orders', getOrders)
router.get('/order/:id', getOrdersById)

export default router

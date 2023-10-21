import express from 'express'
import {
  acceptOrder,
  cancelOrder,
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
router.put('/acceptOrder', acceptOrder)
router.put('/cancelOrder', cancelOrder)

export default router

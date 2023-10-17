import express from 'express'
import { createOrder, getSales, updateOrder } from '../controllers/sales.js'

const router = express.Router()

router.get('/sales', getSales)
router.post('/createOrder', createOrder)
router.put('/updateOrder', updateOrder)

export default router

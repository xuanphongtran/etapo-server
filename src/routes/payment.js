import express from 'express'
import { createPaymentUrl, vnpayIpn, vnpayReturn } from '../controllers/payment.js'

const router = express.Router()

router.post('/create_payment_url', createPaymentUrl)
router.get('/vnpay_ipn', vnpayIpn)
router.get('/vnpay_return', vnpayReturn)
// router.post('/refund', refund)
// router.post('/querydr', querydr)

export default router

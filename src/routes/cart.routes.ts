import { getCart, getWishlist, updateCart, updateWishlist } from '@/controllers/cart.controller'
import authenticate from '@/middleware/auth.middleware'
import express from 'express'

const router = express.Router()

router.get('/getcart', authenticate, getCart)
router.get('/getwishlist', authenticate, getWishlist)
router.put('/updatecart', authenticate, updateCart)
router.put('/updatewishlist', authenticate, updateWishlist)

export default router

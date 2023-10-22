import express from 'express'
import { getCart, getWishlist, updateCart, updateWishlist } from '../controllers/cart.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/getcart', authenticate, getCart)
router.get('/getwishlist', authenticate, getWishlist)
router.put('/updatecart', authenticate, updateCart)
router.put('/updatewishlist', authenticate, updateWishlist)

export default router

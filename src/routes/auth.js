import express from 'express'
import {
  Register,
  Login,
  refreshToken,
  updateProfile,
  getUserInfo,
  getUserOrders,
  lostPassword,
  checkResetToken,
  resetPassword,
} from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)
router.post('/refresh', authenticate, refreshToken)
router.put('/update', authenticate, updateProfile)
router.get('/userinfo', authenticate, getUserInfo)
router.get('/userorders', authenticate, getUserOrders)
router.post('/lostpassword', lostPassword)
router.get('/reset', checkResetToken)
router.post('/reset', resetPassword)

export default router

import {
  checkResetToken,
  getUserInfo,
  getUserOrders,
  Login,
  lostPassword,
  refreshToken,
  Register,
  resetPassword,
  updateProfile
} from '@/controllers/auth.controller'
import authenticate from '@/middleware/auth.middleware'
import express from 'express'

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

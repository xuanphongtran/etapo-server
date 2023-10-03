import express from 'express'
import { Register, Login, refreshToken } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)
router.post('/refresh', authenticate, refreshToken)

export default router

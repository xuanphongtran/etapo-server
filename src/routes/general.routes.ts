import { getDashboardStats, getUser } from '@/controllers/general.controller'
import express from 'express'

const router = express.Router()

router.get('/user/:id', getUser)
router.get('/dashboard', getDashboardStats)

export default router

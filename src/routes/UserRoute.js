import express from 'express'
import userController from '../controllers/UserController.js'

const router = express.Router()

router.get('/', userController.getListUsers)

router.get('/detail', userController.userDetails)

export default router

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import morgan from 'morgan'

import connectDatabase from './src/configs/db.config.js'
import userRouter from './src/routes/UserRoute.js'
import authRouter from './src/routes/AuthRoute.js'
import client from './src/routes/ClienRoute.js'
import general from './src/routes/GeneralRoute.js'
import management from './src/routes/ManagementRoute.js'
import sales from './src/routes/SalesRoute.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 5000

connectDatabase()

app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//Middleware router
app.use('/users', userRouter)
app.use('/auth', authRouter)

//Admin routes
app.use('/client', clientRoutes)
app.use('/general', generalRoutes)
app.use('/management', managementRoutes)
app.use('/sales', salesRoutes)
//Router

app.listen(port, () => {
    console.log('Server is running on port', port)
})

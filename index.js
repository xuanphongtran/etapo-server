import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import connectDatabase from './src/configs/db.config.js'
import clientRoutes from './src/routes/client.js'
import generalRoutes from './src/routes/general.js'
import managementRoutes from './src/routes/management.js'
import salesRoutes from './src/routes/sales.js'
import authRoutes from './src/routes/auth.js'

//configuration
dotenv.config()
const app = express()
const port = process.env.PORT || 5000

connectDatabase()

app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.use('/client', clientRoutes)
app.use('/general', generalRoutes)
app.use('/management', managementRoutes)
app.use('/sales', salesRoutes)
app.use('/auth', authRoutes)

app.listen(port, () => {
  console.log('Server is running on port', port)
})

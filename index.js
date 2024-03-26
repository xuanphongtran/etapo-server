import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { Server } from 'socket.io'

import connectDatabase from './src/configs/db.config.js'
import clientRoutes from './src/routes/client.js'
import generalRoutes from './src/routes/general.js'
import managementRoutes from './src/routes/management.js'
import salesRoutes from './src/routes/sales.js'
import authRoutes from './src/routes/auth.js'
import productRoutes from './src/routes/product.js'
import paymentRoutes from './src/routes/payment.js'
import cartRoutes from './src/routes/cart.js'
import chatRoutes from './src/routes/chat.js'
import { getChatDataAndReturn } from './src/controllers/chat.js'
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

const server = app.listen(port, () => {
  console.log('Server is running on port', port)
})

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
io.on('connection', (socket) => {
  console.log('New client connected' + socket.id)
  socket.emit('getId', socket.id)
  socket.on('sendDataClient', function (data) {
    io.emit('sendDataServer', { data })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

app.use('/client', clientRoutes)
app.use('/general', generalRoutes)
app.use('/management', managementRoutes)
app.use('/sales', salesRoutes)
app.use('/auth', authRoutes)
app.use('/product', productRoutes)
app.use('/payment', paymentRoutes)
app.use('/cart', cartRoutes)
app.use('/chat', chatRoutes)

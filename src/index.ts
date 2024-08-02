import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { Server } from 'socket.io'
import connectDatabase from './configs/db.config'
import { HttpStatusCode } from './constants/httpStatusCode.enum'
import authRoutes from './routes/auth.routes'
import cartRoutes from './routes/cart.routes'
import chatRoutes from './routes/chat.routes'
import clientRoutes from './routes/client.routes'
import generalRoutes from './routes/general.routes'
import managementRoutes from './routes/management.routes'
import paymentRoutes from './routes/payment.routes'
import productRoutes from './routes/product.routes'
import salesRoutes from './routes/sales.routes'

//configuration
dotenv.config()
const app = express()
const port = process.env.PORT || HttpStatusCode.InternalServerError

connectDatabase()

app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

// Health check route
app.get('/health', (req, res) => {
  res.status(HttpStatusCode.Ok).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  })
})

const server = app.listen(port, () => {
  console.log('Server is running on port', port)
})

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
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

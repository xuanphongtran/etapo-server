import express from 'express'
import {
  getCustomers,
  getTransactions,
  getGeography,
  getCategories,
} from '../controllers/client.js'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product.js'

const router = express.Router()

router.get('/products', getProducts)
router.get('/categories', getCategories)
router.get('/customers', getCustomers)
router.get('/transactions', getTransactions)
router.get('/geography', getGeography)
router.post('/products', createProduct)
router.delete('/products/:id', deleteProduct)
router.put('/products/:id', updateProduct)

export default router

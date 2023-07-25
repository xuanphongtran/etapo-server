import express from 'express'
import {
  getCustomers,
  getGeography,
  getCategories,
  getOrders,
  createCategories,
  deleteCategories,
  updateCategories,
} from '../controllers/client.js'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product.js'

const router = express.Router()

router.get('/products', getProducts)
router.get('/categories', getCategories)
router.get('/customers', getCustomers)
router.get('/orders', getOrders)
router.get('/geography', getGeography)
router.post('/products', createProduct)
router.post('/categories', createCategories)
router.delete('/products/:id', deleteProduct)
router.delete('/categories/:id', deleteCategories)
router.put('/products/:id', updateProduct)
router.put('/categories/:id', updateCategories)

export default router

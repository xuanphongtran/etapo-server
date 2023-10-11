import express from 'express'
import {
  createProduct,
  createProperties,
  createReviews,
  deleteProduct,
  deleteProperties,
  getProductById,
  getProducts,
  getProperties,
  getReviews,
  updateProduct,
  updateProperties,
} from '../controllers/product.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/reviews', getReviews)
router.get('/properties', getProperties)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.delete('/:id', deleteProduct)
router.put('/:id', updateProduct)
router.post('/property', createProperties)
router.delete('/property/:id', deleteProperties)
router.put('/property/:id', updateProperties)
router.post('/reviews', authenticate, createReviews)

export default router

import {
  createProduct,
  createProperty,
  createReviews,
  deleteProduct,
  deleteProperty,
  getLikeProducts,
  getProductById,
  getProducts,
  getProperty,
  getReviews,
  updateProduct,
  updateProperty
} from '@/controllers/product.controller'
import authenticate from '@/middleware/auth.middleware'
import express from 'express'

const router = express.Router()

router.get('/likeproducts', getLikeProducts)
router.get('/', getProducts)
router.get('/reviews', getReviews)
router.get('/properties', getProperty)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.delete('/:id', deleteProduct)
router.put('/:id', updateProduct)
router.post('/property', createProperty)
router.delete('/property/:id', deleteProperty)
router.put('/property/:id', updateProperty)
router.post('/reviews', authenticate, createReviews)

export default router

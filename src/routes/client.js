import express from 'express'
import {
  getCustomers,
  getCategories,
  createCategories,
  deleteCategories,
  updateCategories,
  getBrands,
  createBrand,
  deleteBrand,
  updateBrand,
} from '../controllers/client.js'

const router = express.Router()

router.get('/categories', getCategories)
router.get('/brands', getBrands)
router.get('/customers', getCustomers)
router.post('/categories', createCategories)
router.post('/brands', createBrand)
router.delete('/categories/:id', deleteCategories)
router.delete('/brands/:id', deleteBrand)
router.put('/categories/:id', updateCategories)
router.put('/brands/:id', updateBrand)

export default router

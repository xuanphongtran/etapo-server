import {
  createBrand,
  createCategories,
  deleteBrand,
  deleteCategories,
  getBrands,
  getCategories,
  getCustomers,
  updateBrand,
  updateCategories
} from '@/controllers/client.controller'
import express from 'express'

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

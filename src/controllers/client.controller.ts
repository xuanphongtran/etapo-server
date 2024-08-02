import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import Brand from '@/models/Brand'
import Category from '@/models/Category'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { Request, Response } from 'express'

export const getCategories = async (req: Request, res: Response) => {
  try {
    //TODO LEVEL
    const { page = 1, pageSize = 20, sort = null, search = '', level } = req.query
    const catQuery = {
      $or: [{ name: { $regex: new RegExp(String(search), 'i') } }, { level: level }]
    }

    const generalSort = () => {
      const sortParsed = JSON.parse(sort as string)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const cat = await Category.find(catQuery)
      .populate('parent')
      .sort(sortFormatted as any)
      .skip((page as number) * (pageSize as number))
      .limit(pageSize as number)

    const total = await Category.countDocuments({ name: { $regex: search, $options: 'i' } })
    const categories = await Promise.all(
      cat.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id })
        return { ...category.toObject(), productCount }
      })
    )
    res.status(HttpStatusCode.Ok).json({ categories, total })
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
}

export const createCategories = async (req: Request, res: Response) => {
  try {
    const { name, parent, level, image } = req.body

    const parentToUse = parent !== '' ? parent : undefined
    const newCategory = new Category({
      name,
      parent: parentToUse,
      level,
      image
    })

    await newCategory.save()

    res.status(HttpStatusCode.Ok).json({ message: 'Success', newCategory })
  } catch (error: any) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const updateCategories = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, parent, level, image } = req.body

    const parentToUse = parent !== '' ? parent : undefined
    const update = await Category.findByIdAndUpdate(id, { name, parent: parentToUse, level, image })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any category with ID ${id}` })
    }
    const updatedCategory = await Category.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedCategory })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const deleteCategories = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Category.findByIdAndRemove(id)
    res.status(HttpStatusCode.Ok).send('Success')
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

// export const getCategoryById = async (req, res) => {
//   try {
//     const categories = await Category.find()

//     res.status(HttpStatusCode.Ok).json(categories)
//   } catch (error) {
//     res.status(404).json({ message: error })
//   }
// }

export const getBrands = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = '' } = req.query

    const generalSort = () => {
      const sortParsed = JSON.parse(sort as string)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const bra = await Brand.find({
      $or: [{ name: { $regex: new RegExp(String(search), 'i') } }]
    })
      .sort(sortFormatted as any)
      .skip((page as number) * (pageSize as number))
      .limit(pageSize as number)

    const total = await Order.countDocuments({ name: { $regex: search, $options: 'i' } })

    const brands = await Promise.all(
      bra.map(async (brand) => {
        const productCount = await Product.countDocuments({ brand: brand._id })
        return { ...brand.toObject(), productCount }
      })
    )
    res.status(HttpStatusCode.Ok).json({ brands, total })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name } = req.body

    const newBrand = new Brand({
      name
    })

    await newBrand.save()

    res.status(HttpStatusCode.Ok).json({ message: 'Success', newBrand })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const update = await Brand.findByIdAndUpdate(id, req.body)
    if (!update) {
      return res.status(404).json({ message: `Cannot find any brand with ID ${id}` })
    }
    const updatedBrand = await Brand.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedBrand })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Brand.findByIdAndRemove(id)
    res.status(HttpStatusCode.Ok).send('Success')
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password')

    res.status(HttpStatusCode.Ok).json(customers)
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}

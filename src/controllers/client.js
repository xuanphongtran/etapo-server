import User from '../models/User.js'
import Order from '../models/Order.js'
import Category from '../models/Category.js'
import Brand from '../models/Brand.js'
import Product from '../models/Product.js'

export const getCategories = async (req, res) => {
  try {
    //TODO LEVEL
    const { page = 1, pageSize = 20, sort = null, search = '', level } = req.query
    const catQuery = {
      $or: [{ name: { $regex: new RegExp(search, 'i') } }],
    }

    if (level) {
      catQuery.level = level // Adjust 'level' according to your schema
    }
    const generalSort = () => {
      const sortParsed = JSON.parse(sort)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1,
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const cat = await Category.find(catQuery)
      .populate('parent')
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Category.countDocuments({ name: { $regex: search, $options: 'i' } })
    const categories = await Promise.all(
      cat.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id })
        return { ...category.toObject(), productCount }
      }),
    )
    res.status(200).json({ categories, total })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createCategories = async (req, res) => {
  try {
    const { name, parent, level, image } = req.body

    const parentToUse = parent !== '' ? parent : undefined
    const newCategoty = new Category({
      name,
      parent: parentToUse,
      level,
      image,
    })

    await newCategoty.save()

    res.status(200).json({ message: 'Success', newCategoty })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const updateCategories = async (req, res) => {
  try {
    const { id } = req.params
    const { name, parent, level, image } = req.body

    const parentToUse = parent !== '' ? parent : undefined
    const update = await Category.findByIdAndUpdate(id, { name, parent: parentToUse, level, image })
    if (!update) {
      return res.status(404).json({ message: `Cannot find any category with ID ${id}` })
    }
    const updatedCategory = await Category.findById(id)
    res.status(200).json({ message: 'Success', updatedCategory })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const deleteCategories = async (req, res) => {
  try {
    const { id } = req.params
    await Category.findByIdAndRemove(id)
    res.status(200).send('Success')
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// export const getCategoryById = async (req, res) => {
//   try {
//     const categories = await Category.find()

//     res.status(200).json(categories)
//   } catch (error) {
//     res.status(404).json({ message: error.message })
//   }
// }
export const getBrands = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, sort = null, search = '' } = req.query

    const generalSort = () => {
      const sortParsed = JSON.parse(sort)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1,
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}
    const bra = await Brand.find({
      $or: [{ name: { $regex: new RegExp(search, 'i') } }],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Order.countDocuments({ name: { $regex: search, $options: 'i' } })

    const brands = await Promise.all(
      bra.map(async (brand) => {
        const productCount = await Product.countDocuments({ brand: brand._id })
        return { ...brand.toObject(), productCount }
      }),
    )
    res.status(200).json({ brands, total })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body

    const newBrand = new Brand({
      name,
    })

    await newBrand.save()

    res.status(200).json({ message: 'Success', newBrand })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params
    const update = await Brand.findByIdAndUpdate(id, req.body)
    if (!update) {
      return res.status(404).json({ message: `Cannot find any brand with ID ${id}` })
    }
    const updatedBrand = await Brand.findById(id)
    res.status(200).json({ message: 'Success', updatedBrand })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params
    await Brand.findByIdAndRemove(id)
    res.status(200).send('Success')
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password')

    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

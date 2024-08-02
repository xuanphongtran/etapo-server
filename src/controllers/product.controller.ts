import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import Product from '@/models/Product'
import ProductStat from '@/models/ProductStat'
import Property from '@/models/Property'
import Rating from '@/models/Rating'
import { Request, Response } from 'express'

export const getProducts = async (req: Request, res: Response) => {
  try {
    // sort should look like this: { "name": "price", "sort": "desc"}
    const { page = 0, pageSize = 12, sort = null, search = '', category, brand } = req.query
    // formatted sort should look like { userId: -1 }
    const generalSort = () => {
      const sortParsed = JSON.parse(String(sort))
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}

    const product = await Product.find({
      $or: [{ name: { $regex: new RegExp(String(search), 'i') } }],
      ...(category && { category }),
      ...(brand && { brand })
    })
      .sort(sortFormatted as any)
      .skip((page as number) * (pageSize as number))
      .limit(pageSize as number)

    const total = await Product.countDocuments({
      name: { $regex: search, $options: 'i' },
      ...(category && { category }),
      ...(brand && { brand })
    })

    const productWithStats = await Promise.all(
      product.map(async (product: any) => {
        const stat = await ProductStat.findOne({ productId: product._id })
        const rating = await Rating.find({ productId: product._id })
        const totalStarPoints = rating.reduce((acc, item) => acc + (item?.starPoint || 0), 0)
        const averageStarPoint = rating.length > 0 ? Math.round(totalStarPoints / rating.length) : 0
        return {
          ...product._doc,
          stat,
          reviewCount: rating.length,
          averageStarPoint
        }
      })
    )
    res.status(HttpStatusCode.Ok).json({ productWithStats, total, sortFormatted })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, images, discount, category, Property, brand } = req.body
    const { quantity = 100 } = req.body

    const newProduct = new Product({
      name,
      price,
      description,
      discount,
      category,
      Property,
      images,
      brand
    })

    await newProduct.save()

    const newProductStat = new ProductStat({
      productId: newProduct._id,
      quantity: quantity
    })

    await newProductStat.save()

    res.status(HttpStatusCode.Ok).json({ message: 'Success', newProduct })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Product.findByIdAndRemove(id)
    await ProductStat.findOneAndRemove({ productId: id })
    res.status(HttpStatusCode.Ok).send('Success')
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, price, images, description, Property, category, discount, brand, quantity = 100 } = req.body

    const update = await Product.findByIdAndUpdate(id, {
      name,
      price,
      description,
      images,
      Property,
      discount,
      category,
      brand
    })
    const updateStat = await ProductStat.findOneAndUpdate({ productId: id }, { quantity: quantity })
    if (!update) {
      return res.status(404).json({ message: `cannot find any category with ID ${id}` })
    }
    const updatedProduct = await Product.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedProduct, updateStat })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [product, reviews] = await Promise.all([
      Product.findById(id).populate('category', 'name').populate('brand', 'name'),
      Rating.find({ productId: id })
    ])
    const stat = await ProductStat.findOne({ productId: id })
    const totalstarPoints = reviews.reduce((acc, item) => acc + (item.starPoint || 0), 0)
    const averageStarPoint = reviews.length > 0 ? Math.round(totalstarPoints / reviews.length) : 0
    const response = {
      ...product?.toObject(),
      reviewCount: reviews.length,
      averageStarPoint: averageStarPoint,
      quantity: stat?.quantity
    }

    res.status(HttpStatusCode.Ok).json(response)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const getProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.find()
    res.status(HttpStatusCode.Ok).json(property)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { name, value } = req.body

    const newProperty = new Property({
      name,
      value
    })

    await newProperty.save()
    res.status(HttpStatusCode.Ok).json({ message: 'Success', newProperty })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const update = await Property.findByIdAndUpdate(id, req.body)
    if (!update) {
      return res.status(404).json({ message: `Cannot find any property with ID ${id}` })
    }
    const updatedProperty = await Property.findById(id)
    res.status(HttpStatusCode.Ok).json({ message: 'Success', updatedProperty })
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Property.findByIdAndRemove(id)
    res.status(HttpStatusCode.Ok).send('Success')
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ message: error })
  }
}
export const createReviews = async (req: any, res: any) => {
  const userId = req.user._id
  try {
    const { starPoint, comment, productId } = req.body

    const newReview = new Rating({
      starPoint,
      comment,
      productId,
      userId: userId
    })
    await newReview.save()
    res.status(HttpStatusCode.Ok).json({ message: 'Success', newReview })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { pageSize = 8, productId = '' } = req.query

    const reviews = await Rating.find({ productId: productId })
      .limit(pageSize as number)
      .populate('userId', 'name')
    res.status(HttpStatusCode.Ok).json(reviews)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
export const getLikeProducts = async (req: Request, res: Response) => {
  try {
    const randomDocuments = await Product.aggregate([
      { $sample: { size: 8 } } // Lấy mẫu 10 phần tử ngẫu nhiên
    ])

    const products = await Promise.all(
      randomDocuments.map(async (product) => {
        const stat = await ProductStat.findOne({ productId: product._id })
        const rating = await Rating.find({ productId: product._id })
        const totalstarPoints = rating.reduce((acc, item) => acc + (item.starPoint || 0), 0)
        const averageStarPoint = rating.length > 0 ? Math.round(totalstarPoints / rating.length) : 0
        return {
          ...product,
          stat,
          reviewCount: rating.length,
          averageStarPoint
        }
      })
    )
    res.status(HttpStatusCode.Ok).json(products)
  } catch (error) {
    res.status(HttpStatusCode.InternalServerError).json({ error: 'Internal Server Error' })
  }
}

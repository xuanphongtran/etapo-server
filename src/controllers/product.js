import Product from '../models/Product.js'
import Properties from '../models/Property.js'
import ProductStat from '../models/ProductStat.js'
import Rating from '../models/Rating.js'

export const getProducts = async (req, res) => {
  try {
    // sort should look like this: { "name": "price", "sort": "desc"}
    const { page = 0, pageSize = 12, sort = null, search = '', category, brand } = req.query
    // formatted sort should look like { userId: -1 }
    const generalSort = () => {
      const sortParsed = JSON.parse(sort)
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == 'asc' ? 1 : -1,
      }
      return sortFormatted
    }
    const sortFormatted = sort ? generalSort() : {}

    const product = await Product.find({
      $or: [{ name: { $regex: new RegExp(search, 'i') } }],
      ...(category && { category }),
      ...(brand && { brand }),
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Product.countDocuments({
      name: { $regex: search, $options: 'i' },
      ...(category && { category }),
      ...(brand && { brand }),
    })

    const productWithStats = await Promise.all(
      product.map(async (product) => {
        const stat = await ProductStat.findOne({ productId: product._id })
        const rating = await Rating.find({ productId: product._id })
        const totalstarPoints = rating.reduce((acc, item) => acc + item.starPoint, 0)
        const averageStarPoint = rating.length > 0 ? Math.round(totalstarPoints / rating.length) : 0
        return {
          ...product._doc,
          stat,
          reviewCount: rating.length,
          averageStarPoint,
        }
      }),
    )
    res.status(200).json({ productWithStats, total, sortFormatted })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, images, discount, category, properties, brand } = req.body
    const { quantity = 100 } = req.body

    const newProduct = new Product({
      name,
      price,
      description,
      discount,
      category,
      properties,
      images,
      brand,
    })

    await newProduct.save()

    const newProductStat = new ProductStat({
      productId: newProduct._id,
      quantity: quantity,
    })

    await newProductStat.save()

    res.status(200).json({ message: 'Success', newProduct })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    await Product.findByIdAndRemove(id)
    await ProductStat.findOneAndRemove({ productId: id })
    res.status(200).send('Success')
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      price,
      images,
      description,
      properties,
      category,
      discount,
      brand,
      quantity = 100,
    } = req.body

    const update = await Product.findByIdAndUpdate(id, {
      name,
      price,
      description,
      images,
      properties,
      discount,
      category,
      brand,
    })
    const updateStat = await ProductStat.findOneAndUpdate({ productId: id }, { quantity: quantity })
    if (!update) {
      return res.status(404).json({ message: `cannot find any category with ID ${id}` })
    }
    const updatedProduct = await Product.findById(id)
    res.status(200).json({ message: 'Success', updatedProduct, updateStat })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const [product, reviews] = await Promise.all([
      Product.findById(id).populate('category', 'name').populate('brand', 'name'),
      Rating.find({ productId: id }),
    ])
    const stat = await ProductStat.findOne({ productId: id })
    const totalstarPoints = reviews.reduce((acc, item) => acc + item.starPoint, 0)
    const averageStarPoint = reviews.length > 0 ? Math.round(totalstarPoints / reviews.length) : 0
    const response = {
      ...product.toObject(),
      reviewCount: reviews.length,
      averageStarPoint: averageStarPoint,
      quantity: stat?.quantity,
    }

    res.status(200).json(response)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getProperties = async (req, res) => {
  try {
    const properties = await Properties.find()
    res.status(200).json(properties)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createProperties = async (req, res) => {
  try {
    const { name, value } = req.body

    const newProperties = new Properties({
      name,
      value,
    })

    await newProperties.save()
    res.status(200).json({ message: 'Success', newProperties })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const updateProperties = async (req, res) => {
  try {
    const { id } = req.params
    const update = await Properties.findByIdAndUpdate(id, req.body)
    if (!update) {
      return res.status(404).json({ message: `Cannot find any property with ID ${id}` })
    }
    const updatedProperty = await Properties.findById(id)
    res.status(200).json({ message: 'Success', updatedProperty })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const deleteProperties = async (req, res) => {
  try {
    const { id } = req.params
    await Properties.findByIdAndRemove(id)
    res.status(200).send('Success')
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const createReviews = async (req, res) => {
  const userId = req.user._id
  try {
    const { starPoint, comment, productId } = req.body

    const newReview = new Rating({
      starPoint,
      comment,
      productId,
      userId: userId,
    })
    await newReview.save()
    res.status(200).json({ message: 'Success', newReview })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getReviews = async (req, res) => {
  try {
    const { pageSize = 8, productId = '' } = req.query

    const reviews = await Rating.find({ productId: productId })
      .limit(pageSize)
      .populate('userId', 'name')
    res.status(200).json(reviews)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getLikeProducts = async (req, res) => {
  try {
    const randomDocuments = await Product.aggregate([
      { $sample: { size: 8 } }, // Lấy mẫu 10 phần tử ngẫu nhiên
    ])

    const products = await Promise.all(
      randomDocuments.map(async (product) => {
        const stat = await ProductStat.findOne({ productId: product._id })
        const rating = await Rating.find({ productId: product._id })
        const totalstarPoints = rating.reduce((acc, item) => acc + item.starPoint, 0)
        const averageStarPoint = rating.length > 0 ? Math.round(totalstarPoints / rating.length) : 0
        return {
          ...product,
          stat,
          reviewCount: rating.length,
          averageStarPoint,
        }
      }),
    )
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

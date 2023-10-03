import Product from '../models/Product.js'
import ProductStat from '../models/Product.js'

export const getProducts = async (req, res) => {
  try {
    // sort should look like this: { "name": "price", "sort": "desc"}
    const { page = 0, pageSize = 12, sort = null, search = '' } = req.query

    // formatted sort should look like { userId: -1 }
    const generateSort = () => {
      const sortParsed = JSON.parse(sort)
      const sortFormatted = {
        // eslint-disable-next-line no-constant-condition
        [sortParsed.field]: (sortParsed.sort = 'asc' ? 1 : -1),
      }

      return sortFormatted
    }
    const sortFormatted = sort ? generateSort() : {}

    const product = await Product.find({
      $or: [
        // { price: { $regex: new RegExp(search, 'i') } },
        { name: { $regex: new RegExp(search, 'i') } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Product.countDocuments({
      name: { $regex: search, $options: 'i' },
    })

    const productWithStats = await Promise.all(
      product.map(async (product) => {
        const stat = await ProductStat.find({ productId: product._id })
        return {
          ...product._doc,
          stat,
        }
      }),
    )
    res.status(200).json({ productWithStats, total })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, images, discount, category, properties, gender } = req.body

    const newProduct = new Product({
      name,
      price,
      description,
      discount,
      category,
      properties,
      images,
      gender,
    })

    await newProduct.save()
    res.status(200).json({ message: 'Success', newProduct })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    await Product.findByIdAndRemove(id)
    res.status(200).send('Success')
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, images, description, properties, category, discount, gender } = req.body

    const update = await Product.findByIdAndUpdate(id, {
      name,
      price,
      description,
      images,
      properties,
      discount,
      category,
      gender,
    })
    if (!update) {
      return res.status(404).json({ message: `cannot find any category with ID ${id}` })
    }
    const updatedProduct = await Product.findById(id)
    res.status(200).json({ message: 'Success', updatedProduct })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    res.status(200).json(product)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

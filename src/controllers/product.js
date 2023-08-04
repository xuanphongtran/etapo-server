import Product from '../models/Product.js'
import ProductStat from '../models/Product.js'

export const getProducts = async (req, res) => {
  try {
    const product = await Product.find()

    const productWithStats = await Promise.all(
      product.map(async (product) => {
        const stat = await ProductStat.find({ productId: product._id })
        return {
          ...product._doc,
          stat,
        }
      }),
    )
    res.status(200).json(productWithStats)
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

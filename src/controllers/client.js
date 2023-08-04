import User from '../models/User.js'
import Order from '../models/Order.js'
import getCountryIso3 from 'country-iso-2-to-3'
import Category from '../models/Category.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()

    res.status(200).json(categories)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
export const createCategories = async (req, res) => {
  try {
    const { name, properties } = req.body

    const newCategoty = new Category({
      name,
      properties,
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
    const update = await Category.findByIdAndUpdate(id, req.body)
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

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password')

    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getOrders = async (req, res) => {
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
    const orders = await Order.find({
      $or: [
        { cost: { $regex: new RegExp(search, 'i') } },
        { userId: { $regex: new RegExp(search, 'i') } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Order.countDocuments({ name: { $regex: search, $options: 'i' } })

    res.status(200).json({ orders, total })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getGeography = async (req, res) => {
  try {
    const users = await User.find()

    const mappedLocation = users.reduce((acc, { country }) => {
      const countryISO3 = getCountryIso3(country)
      if (!acc[countryISO3]) {
        acc[countryISO3] = 0
      }
      acc[countryISO3]++
      return acc
    }, {})

    const formattedLocation = Object.entries(mappedLocation).map(([country, count]) => {
      return { id: country, value: count }
    })

    res.status(200).json(formattedLocation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

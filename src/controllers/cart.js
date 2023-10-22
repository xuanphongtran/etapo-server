import CartProducts from '../models/CartProduct.js'

export const getCart = async (req, res) => {}
export const updateCart = async (req, res) => {
  try {
    const { userId } = req.body
    const newWishlist = new CartProducts({
      userId: userId,
    })
    const wishlist = await newWishlist.save()
    return res.status(200).json(wishlist)
  } catch (error) {
    console.error(error)
    return res.status(500).json('Lỗi server.')
  }
}
export const getWishlist = async (req, res) => {}
export const updateWishlist = async (req, res) => {}

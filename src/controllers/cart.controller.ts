import { HttpStatusCode } from '@/constants/httpStatusCode.enum'
import CartProducts from '@/models/CartProduct'
import { Request, Response } from 'express'

interface UpdateCartRequestBody {
  userId: string
}

export const updateCart = async (req: Request<{}, {}, UpdateCartRequestBody>, res: Response): Promise<Response> => {
  try {
    const { userId } = req.body
    const newWishlist = new CartProducts({
      userId: userId
    })
    const wishlist = await newWishlist.save()
    return res.status(HttpStatusCode.Ok).json(wishlist)
  } catch (error) {
    console.error(error)
    return res.status(HttpStatusCode.InternalServerError).json('Lỗi server.')
  }
}
export const getCart = async (req: Request, res: Response) => {}

export const getWishlist = async (req: Request, res: Response) => {}

export const updateWishlist = async (req: Request, res: Response) => {}

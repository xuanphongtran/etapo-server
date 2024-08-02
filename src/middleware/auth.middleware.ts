import { ACCESS_TOKEN_SECRET } from '@/constants/env'
import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'

const authenticate = (req: any, res: any, next: any) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const parserTokens = req.headers.authorization.split('Bearer ')
      token = parserTokens[1]
    }
    // Make sure token exists
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized'
    })
  }
}

export default authenticate

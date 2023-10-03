import jwt from 'jsonwebtoken'
import httpStatus from 'http-status'

// Protect routes
export const authenticate = (req, res, next) => {
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
        message: 'Not authorized',
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized',
    })
  }
}

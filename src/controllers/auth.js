import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt, { verify } from 'jsonwebtoken'
import randToken from 'rand-token'

export const Register = async (req, res) => {
  const { name, email, password, ...otherParams } = req.body
  const SALT_ROUNDS = 10
  try {
    const existingEmail = await User.findOne({ email: email })

    if (existingEmail) {
      return res.status(409).send('Email đã được sử dụng.')
    }

    const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS)

    const newUser = new User({
      name,
      password: hashPassword,
      email, // Assuming the password is already hashed in your model
      ...otherParams,
    })

    const savedUser = await newUser.save()

    if (!savedUser) {
      return res.status(400).send('Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.')
    }

    return res.send({
      username: savedUser.username,
      // Include other relevant information if needed
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Lỗi server.')
  }
}
export const Login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email: email })

    if (!user) {
      return res.status(401).send('Email không tồn tại.')
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).send('Mật khẩu không chính xác.')
    }

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    const dataForAccessToken = {
      _id: user._id,
    }

    const accessToken = jwt.sign(dataForAccessToken, accessTokenSecret, {
      expiresIn: accessTokenLife,
    })

    let refreshToken = randToken.generate(64)

    if (!user.refreshToken) {
      // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
      user.refreshToken = refreshToken
      await user.save()
    } else {
      // Nếu user này đã có refresh token thì lấy refresh token đó từ database
      refreshToken = user.refreshToken
    }

    return res.json({
      msg: 'Đăng nhập thành công.',
      accessToken,
      refreshToken,
      user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Lỗi server.')
  }
}

export const refreshToken = async (req, res) => {
  // Lấy access token từ header
  let accessToken
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const parserTokens = req.headers.authorization.split('Bearer ')
    accessToken = parserTokens[1]
  }
  if (!accessToken) {
    return res.status(400).send('Không tìm thấy access token.')
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken
  if (!refreshTokenFromBody) {
    return res.status(400).send('Không tìm thấy refresh token.')
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE

  try {
    // Decode access token đó
    const decoded = await decodeToken(accessToken, accessTokenSecret)
    if (!decoded) {
      return res.status(400).send('Access token không hợp lệ.')
    }

    const email = decoded.payload.email // Lấy username từ payload

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).send('User không tồn tại.')
    }

    if (refreshTokenFromBody !== user.refreshToken) {
      return res.status(400).send('Refresh token không hợp lệ.')
    }

    // Tạo access token mới
    const dataForAccessToken = {
      _id: user._id,
    }

    const newAccessToken = jwt.sign(dataForAccessToken, accessTokenSecret, {
      expiresIn: accessTokenLife,
    })
    if (!newAccessToken) {
      return res.status(400).send('Tạo access token mới không thành công, vui lòng thử lại.')
    }

    return res.json({
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Lỗi server.')
  }
}
const decodeToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {
      ignoreExpiration: true,
    })
  } catch (error) {
    console.log(`Error in decode access token: ${error}`)
    return null
  }
}

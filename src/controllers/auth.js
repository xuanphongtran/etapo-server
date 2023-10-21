import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt, { verify } from 'jsonwebtoken'
import randToken from 'rand-token'
import nodemailer from 'nodemailer'

export const Register = async (req, res) => {
  const { fullName, email, password, passwordAgain, ...otherParams } = req.body
  const SALT_ROUNDS = 10
  try {
    const existingEmail = await User.findOne({ email: email })

    if (existingEmail) {
      return res.status(409).send('Email đã được sử dụng.')
    }

    if (password !== passwordAgain) {
      return res.status(409).send('Mật khẩu không giống nhau.')
    }

    const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS)

    const newUser = new User({
      name: fullName,
      password: hashPassword,
      email, // Assuming the password is already hashed in your model
      ...otherParams,
    })

    const savedUser = await newUser.save()

    if (!savedUser) {
      return res.status(400).send('Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.')
    }

    return res.send({
      email: savedUser.email,
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
export const updateProfile = async (req, res) => {
  const userId = req.user._id
  try {
    const userData = req.body

    // Update user data with userId
    await User.findByIdAndUpdate(userId, userData)

    res.status(200).send('Cập nhập thông tin cá nhân thành công')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}
export const getUserInfo = async (req, res) => {
  const userId = req.user._id
  try {
    // Find user by _id and exclude _id and password fields
    const user = await User.findById(userId, '-_id -password -orders')

    if (!user) {
      return res.status(404).send('User not found.')
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Error retrieving user information:', error)
    res.status(500).send('Internal Server Error')
  }
}
export const getUserOrders = async (req, res) => {
  const userId = req.user._id
  try {
    // Find user by _id and exclude _id and password fields
    const user = await User.findById(userId, 'orders')

    if (!user) {
      return res.status(404).send('User not found.')
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Error retrieving user information:', error)
    res.status(500).send('Internal Server Error')
  }
}
export const lostPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email: email })
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE

  if (user) {
    // Tạo reset token mới
    const dataForResetToken = {
      _id: user._id,
    }
    // Tạo mã xác nhận và lưu vào user
    const newResetToken = jwt.sign(dataForResetToken, accessTokenSecret, {
      expiresIn: accessTokenLife,
    })
    // user.resetToken = newResetToken
    await User.findOneAndUpdate({ email: email }, { resetToken: newResetToken })
    sendResetEmail(email, newResetToken)

    res.status(200).json('Email đặt lại mật khẩu đã được gửi.')
  } else {
    res.status(401).json('Email không tồn tại')
  }
}
const sendResetEmail = (email, resetToken) => {
  const mailOptions = {
    from: 'Ziggy',
    to: email,
    subject: 'Đặt lại mật khẩu',
    text: `Vào đường dẫn này để đặt lại mật khẩu: ${process.env.RESET_URL}?query=${resetToken}`,
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
export const checkResetToken = async (req, res) => {
  let token = req.query?.query

  if (token == null) {
    return res.status(500).json('Invalid or expired token')
  }

  const user = await User.findOne({ resetToken: token })
  if (user) {
    // Hiển thị form đặt lại mật khẩu
    res.status(200).json(user.email)
  } else {
    res.status(500).json('Invalid or expired token')
  }
}

// Route xử lý đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const resetToken = req.body.token
  const newPassword = req.body.newPassword
  const user = await User.findOne({ resetToken: resetToken })
  const SALT_ROUNDS = 10
  if (user) {
    // Cập nhật mật khẩu và xóa mã xác nhận
    const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS)

    await User.findOneAndUpdate(
      { resetToken: resetToken },
      { resetToken: null, password: hashPassword },
    )
    res.send('Password reset successful')
  } else {
    res.send('Invalid or expired token')
  }
}

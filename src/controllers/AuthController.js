import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/UserModel.js'

const register = async (req, res) => {
    try {
        const { username, password, email } = req.body
        await userModel.create({
            username: username,
            password: bcrypt.hashSync(password, 10),
            email: email,
            role: 'user',
        })
        return res.status(200).json({ message: 'Hello ' })
    } catch (err) {
        console.log(err)
    }
}
const login = async (req, res) => {
    //Check username
    const user = await userModel.findOne({ username: req.body.username })
    if (!user) {
        return res.status(400).json({ message: 'Tài khoản không tồn tại' })
    }
    //Check password
    const validPassword = bcrypt.compareSync(req.body.password, user.password)
    if (!validPassword) {
        return res.status(400).json({ message: 'Mật khẩu không chính xác' })
    }

    //Create JWT
    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '10h' }
    )

    return res
        .status(200)
        .json({ message: 'Đăng nhập thành công', accessToken: token })
}

export default  {
    register: register,
    login: login,
}

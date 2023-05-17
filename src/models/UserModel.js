import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    email: String,
    password: String,
    role: String,
})

const userModel = mongoose.model('User', userSchema)

export default userModel

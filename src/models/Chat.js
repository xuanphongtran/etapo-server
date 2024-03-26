import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  chatDate: {
    type: Date,
  },
  content: {
    type: String,
  },
  from_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  to_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  chatCategory: {
    type: String,
  },
})

const Chat = mongoose.model('Chat', chatSchema)

export default Chat

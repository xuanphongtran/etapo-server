import Chat from '../models/Chat.js'

export const addAChat = async (req, res) => {
  try {
    const newChat = new Chat({
      chatDate: new Date(),
      content: req.body.content,
      from_id: req.body.from_id,
      to_id: req.body.to_id,
    })
    // Chat.create(newChat, (err, result) => {
    //   res.json(newChat)
    // })
    const saveChat = await newChat.save()
    return res.status(200).json(saveChat)
  } catch (error) {
    return res.status(500).send('Lỗi server.')
  }
}

export const getChat = async (req, res) => {
  const result1 = await Chat.find({
    from_id: req.body.user1_id,
    to_id: req.body.user2_id,
  }).populate('from_id')
  const result2 = await Chat.find({
    from_id: req.body.user2_id,
    to_id: req.body.user1_id,
  }).populate('from_id')
  const result3 = [...result1, ...result2]
  result3.sort((a, b) => {
    return a.chatDate > b.chatDate ? 1 : -1
  })
  res.json(result3)
}

export const getChatDataAndReturn = async (data) => {
  const result = await Chat.create({
    chatDate: data.chatDate,
    content: data.content,
    from_id: data.from_id,
    to_id: data.to_id,
    chatCategory: data.chatCategory,
  })
  return await Chat.findOne({
    _id: result._id,
  }).populate('from_id')
}
export const loadImage = (req, res) => {
  res.json({ name: req.file?.filename })
}

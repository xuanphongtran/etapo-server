import { addAChat, getChat, loadImage } from '@/controllers/chat.controller'
import express from 'express'
import multer from 'multer'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ' - ' + file.originalname)
  }
})
const upload = multer({ storage: storage })
const router = express.Router()

router.post('/loadImage', upload.single('file'), loadImage)
router.post('/getChat', getChat)
router.post('/addChat', addAChat)
export default router

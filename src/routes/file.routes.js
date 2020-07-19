import { Router } from 'express'
import File from '../models/File'
import multer from 'multer'
import multerConfig from '../config/multer'


const fileRoutes = Router()
const upload = multer(multerConfig)

fileRoutes.post('/', upload.single('file'), async (request, response) => {
  const { originalname: name, filename: path} = request.file
  const file = await File.create({name, path})
  return response.json(file)
})

export default fileRoutes

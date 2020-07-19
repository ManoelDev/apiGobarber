import { Router } from 'express'
import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import authConfig from '../config/auth'
import User from '../models/User'
import File from '../models/File'

const authRouter = Router()

authRouter.post('/', async (request, response) => {
  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required()
  })

  if (!(await schema.isValid(request.body))) return response.status(401).json({ error: 'Validations fails' })
  const { email, password } = request.body

  const user = await User.findOne({ where: { email }, include: [{ model: File, as:'avatar', attributes: ['id', 'path', 'url']}] })
  if (!user) return response.status(401).json({ error: 'User not found' })
  if (!(await user.checkPassword(password))) return response.status(401).json({ error: 'Password does not match' })

  const { id, name, avatar, provider } = user
  return response.json({
    user: { id, name, email, provider, avatar },
    token: jwt.sign({ id }, authConfig.secret, { expiresIn: authConfig.expiresIn })
  })
}
)

export default authRouter

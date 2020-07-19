import { Router } from 'express'
import * as Yup from 'yup'
import User from '../models/User'
import File from '../models/File'

import authJWT from '../middlewares/auth'

const usersRouter = Router()

usersRouter.post('/', async (request, response) => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required().min(6)
  })
  if (!(await schema.isValid(request.body))) return response.status(401).json({ error: 'Validations fails' })

  const userExist = await User.findOne({ where: { email: request.body.email } })

  if (userExist) return response.status(400).json({ error: 'Email elready existe' })

  const { id, name, email, provider } = await User.create(request.body)

  return response.json({
    id, name, email, provider
  })
})

usersRouter.put('/', authJWT, async (request, response) => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email(),
    oldPassword: Yup.string().min(6),
    password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => oldPassword ? field.required() : field),
    confirmPassword: Yup.string().when('password', (password, field) => password ? field.required().oneOf([Yup.ref('password')]) : field)
  })
  if (!(await schema.isValid(request.body))) return response.status(401).json({ error: 'Validations fails' })

  const { email, oldPassword } = request.body
  const user = await User.findByPk(request.userId)
  if (email !== user.email) {
    const userExist = await User.findOne({ where: { email } })
    if (userExist) return response.status(400).json({ error: 'Email elready existe' })
  }

  if (oldPassword && !(await user.checkPassword(oldPassword))) return response.status(401).json({ error: 'Password does not match' })
  await user.update(request.body)
  const { id, name, avatar } = await User.findByPk(request.userId,{ include: [{model: File, as: 'avatar', attributes:['id', 'path', 'url']}]})
  return response.json({ id, name, email, avatar })
}
)
// usersRouter.post('/', async (request, response) => {})
export default usersRouter

import { verify } from 'jsonwebtoken'
import authConfig from '../config/auth'

export default function AuthJWT (request, response, next) {
  const authHeader = request.headers.authorization
  if (!authHeader) return response.status(401).json({ error: 'Token not provider' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = verify(token, authConfig.secret)
    request.userId = decoded.id
    return next()
  } catch (err) {
    return response.status(401).json({ message: 'Token invalid' })
  }
}

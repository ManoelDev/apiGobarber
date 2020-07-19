import { Router } from 'express'
import User from '../models/User'
import authJWT from '../middlewares/auth'
import Notification from '../schemas/Notification'

const notificationRoutes= Router()

notificationRoutes.get('/', authJWT, async(request, response)=>{
  const checkIsProvider = await User.findOne({
    where:{ id: request.userId, provider: true}
  })
  if (!checkIsProvider) return response.status(401).json({ error: 'Only provider can load notifications'})

  const notifications = await Notification.find({ user: request.userId,}).sort({cretedAt: 'desc'}).limit(20)


  return response.json(notifications)
})

notificationRoutes.put('/:id', authJWT, async(request, response)=>{
  const notification = await Notification.findByIdAndUpdate(
    request.params.id,
    { read: true },
    { new: true }
  )

  return response.json(notification)

})

export default notificationRoutes
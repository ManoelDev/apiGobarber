import {Router} from 'express'
import { startOfHour, parseISO, isBefore, format, subHours, parse} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Appointments from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import * as Yup from 'yup'
import Notification from '../schemas/Notification'

import CancellationMail from '../jobs/CancellationMail'
import Queue from '../lib/Queue'
import authJWT from '../middlewares/auth'

const appointmentRoutes = Router()
// appointmentRoutes.get('/', async (request, response) => {})

appointmentRoutes.get('/', authJWT, async (request, response) => {
  const { page = 1 } =  request.query
  const appointement = await Appointments.findAll({
    where: { user_id: request.userId, canceled_at: null },
    order: ['date'],
    attributes: ['id', 'date', 'past', 'cancelable'],
    limit: 20,
    offset: (page -1 ) * 20,
    include: [{
      model: User, as: 'provider',
      attributes: ['id', 'name'],
      include:[{model: File, as: 'avatar', attributes:['path', 'url']}]
    }]
  })
  return response.json(appointement)
})

appointmentRoutes.post('/', authJWT, async (request, response) => {
  const schema = Yup.object().shape({
    provider_id: Yup.number().required(),
    date: Yup.date().required()
  })

  if (!(await schema.isValid(request.body))) return response.status(400).json({error: 'Validation Fails'})

  const {provider_id, date} = request.body

  const checkIsProvider = await User.findOne({ where:{ id: provider_id, provider: true} })
  if(!checkIsProvider) return response.status(401).json({error: 'You can only create appointements with providers'})

  const hourStart = startOfHour(parseISO(date))

  if (isBefore(hourStart, new Date())) return response.status(400).json({error: 'Past dates are not permitted'})

  const checkAvailability = await Appointments.findOne({where: {provider_id, canceled_at: null, date: hourStart}})
  if (checkAvailability) return response.status(400).json({error: 'Appointment date is not available'})

  const appointement = await Appointments.create({user_id: request.userId, provider_id, date})

  const user = await User.findByPk(request.userId)
  const formattedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", { locale: ptBR } )

  await Notification.create({
    content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
    user: provider_id
  })

  return response.json(appointement)
})

appointmentRoutes.delete('/:id', authJWT, async (request, response) => {

  const appointment = await Appointments.findByPk(request.params.id,{ include: [
    { model: User, as: 'provider', attributes:['name', 'email'] },
    { model: User, as: 'user', attributes: ['name'] }
  ]})

  if (!appointment) return response.status(401).json({ error: 'No ave appointments.'})
  if (appointment.user_id !== request.userId) return response.status(401).json({ error: 'You dont have permission to cancel this apointment.'})
  const dateWithSub = subHours(appointment.date, 2) 
  if ( isBefore(dateWithSub, new Date())) return response.status(401).json({ error: 'You can only cancel appointments 2 hours in advance.'})

  appointment.canceled_at = new Date().toISOString()
  await appointment.save()

  await Queue.add(CancellationMail.key, { appointment })

  return response.json(appointment)
})

export default appointmentRoutes



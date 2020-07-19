import {Router} from 'express'
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointment'
import authJWT from '../middlewares/auth'
import User from '../models/User'

const scheduleRoutes = Router()

scheduleRoutes.get('/', authJWT, async (request, response) => {
  const chckUserProvider = await User.findOne({ where:{ id: request.userId, provider: true }})
  if (!chckUserProvider) return response.status(401).json({errot: 'User is not a provider'})
  const {date} = request.query
  const parseDate = parseISO(date)

  const appointments = await Appointments.findAll({
    where: { 
      provider_id: request.userId, 
      canceled_at: null, 
      date: { [Op.between]: [ startOfDay(parseDate), endOfDay(parseDate) ] }, 
    },
    include:[{model: User, as:'user', attributes: ['name']}],
    order: ['date']
  })

  return response.json(appointments)
})

export default scheduleRoutes

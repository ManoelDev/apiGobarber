import { Router } from 'express'
import { startOfDay, endOfDay, setHours, setMinutes, setSeconds, format, isAfter} from 'date-fns'
import User from '../models/User'
import File from '../models/File'
import Appointment from '../models/Appointment';

import authJWT from '../middlewares/auth'
import { Op } from 'sequelize';

const providerRoutes = Router()

providerRoutes.get('/',authJWT, async (request, response) => {
  const provider = await User.findAll({ 
    where: { provider: true }, 
    attributes:['id', 'name', 'avatar_id'],
    include:[{model: File, as: 'avatar', attributes:['name', 'path', 'url']}]
  })
  return response.json({provider})
})

providerRoutes.get('/:provider_id/available',authJWT, async (request, response) => {
  const { date } = request.query

  if (!date) return response.status(400).json({error: 'Invalid Data'})

  const searchDate = Number(date)

  const appointments = await Appointment.findAll({
    where:{
      provider_id: request.params.provider_id,
      canceled_at: null,
      date: {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)]
      }
    }
  })

  const schedule = [
    '08:00',
    '09:00', 
    '10:00', 
    '11:00', 
    '12:00', 
    '13:00', 
    '14:00', 
    '15:00', 
    '16:00', 
    '17:00', 
    '18:00', 
    '19:00',
    '20:00', 
    '21:00', 
    '22:00', 
    '23:00', 
  ]

  const available =  schedule.map( time => {
    const [hour, minute] = time.split(':')
    const value = setSeconds(setMinutes(setHours(searchDate, hour), minute), 0)

    return {
      time,
      value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      available: isAfter(value, new Date()) &&
        !appointments.find(a => format(a.date, 'HH:mm') === time)
    }
  })


  return response.json(available)
})

export default providerRoutes
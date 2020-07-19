import 'dotenv/config'
import Sequelize from 'sequelize'
import mongoose from 'mongoose'

import User from '../models/User'
import File from '../models/File'
import Appointment from '../models/Appointment'

import databaseConfig from '../config/database'

const models = [User, File, Appointment]

class Database {
  constructor () {
    this.init()
    this.mongo()
  }

  init () {
    this.connection = new Sequelize(databaseConfig)

    models.map(model => model.init(this.connection))
    models.map(model => model.associate && model.associate(this.connection.models))
  }

  mongo(){
    this.mongoConnection = mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}` ,{ 
      auth: {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASS || null
      },
      authSource: "admin",
      useNewUrlParser: true, 
      useFindAndModify: true,
      useUnifiedTopology: true 
    })
  }
}

export default new Database()

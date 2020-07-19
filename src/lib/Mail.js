import nodemainler from 'nodemailer'
import { resolve } from 'path'
import exphbs from 'express-handlebars'
import nodemailerhbs from 'nodemailer-express-handlebars'
import mailConfig from '../config/mail'

class Mail {
  constructor(){
    const { host, port, secure, auth} = mailConfig
    this.transpoter = nodemainler.createTransport({
      host, port, secure, auth: auth.pass ? auth : null
    })
    this.configureTemplates()
  }
  configureTemplates(){
    const viewPath = resolve(__dirname, '..', 'views', 'emails')

    this.transpoter.use('compile', nodemailerhbs({
      viewEngine: exphbs.create({
        layoutsDir: resolve(__dirname, '..', 'views', 'emails', 'layouts'),
        partialsDir: resolve(__dirname, '..', 'views', 'emails', 'partials'),
        defaultLayout: 'default',
        extname: '.hbs'
      }),
      viewPath,
      extName: '.hbs',      
    }))
  }
  
  sendMail (message){
    return this.transpoter.sendMail({
      ...mailConfig.default,
      ...message
    })
  }
}
export default new Mail()
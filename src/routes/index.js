import { Router } from 'express'

import UserController from './users.routes'
import Sessions from './sessions.routes'
import FilesUpload from './file.routes'
import Providers from './porviders.routes'
import Appointments from './appointments.routes'
import Schedule from './schedule.routes';
import Notifications from './notifications.routes'

const routes = Router()

routes.use('/users', UserController)
routes.use('/sessions', Sessions)
routes.use('/files', FilesUpload)
routes.use('/providers', Providers)
routes.use('/appointments', Appointments)
routes.use('/schedule', Schedule)
routes.use('/notifications', Notifications)

export default routes

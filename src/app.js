import express from 'express'
import './db/mongoose.js'
import taskRouter from './routers/task.js'
import userRouter from './routers/user.js'

const app = express()

//parse incoming json to an object so that we can access it in request handler
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

export default app
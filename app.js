import express, { json, urlencoded } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import os from 'os'
import errorHandler from './middleware/error.middleware.js'
import notificationRoutes from './routes/notification.routes.js'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
)

app.use(helmet())
app.use(cookieParser())

app.use(json())
app.use(urlencoded({ extended: true }))

// ❤️ health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    serviceName: config.server.serviceName,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss,
    hostname: os.hostname(),
  })
})

// API routes here twin </3
app.use('/api/notifications', notificationRoutes)

// handle unkown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Request ${req.method} to ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

export default app

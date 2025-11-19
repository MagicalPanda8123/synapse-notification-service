import { Server } from 'socket.io'
import authMiddleware from './middleware/auth.middleware.js'
import { EVENTS } from './utils/socket-events.js'
import { connectionHandler } from './handlers/connection.handler.js' // ensure this import exists

let ioInstance = null

export default function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000', // Allow requests from the frontend
      credentials: true, // Allow cookies and credentials
    },
  })

  io.use(authMiddleware)

  // Connection lifecycle
  io.on(EVENTS.CONNECTION, (socket) => connectionHandler(io, socket))

  ioInstance = io
  return io
}

// Export getter for other modules (consumers) to use
export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initializeSocketServer first.')
  }
  return ioInstance
}

import { EVENTS } from '../utils/socket-events.js'

export function connectionHandler(io, socket) {
  const userId = socket.user.sub // Assume user ID is available after authentication
  const userNotificationRoom = `user:${userId}` // Define the notification room

  console.log(`[Socket] New client connected: ${socket.id} - userId: ${userId}`)

  // Automatically join the user's notification room
  socket.join(userNotificationRoom)
  console.log(`[Socket] User ${userId} automatically joined notification room: ${userNotificationRoom}`)

  // Register specific event handlers

  // Handle disconnection
  socket.on(EVENTS.DISCONNECT, () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
}

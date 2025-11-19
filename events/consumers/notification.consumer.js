import { getChannel } from '../../config/rabbitmq.js'
import * as notificationService from '../../services/notification.service.js'
import { getIO } from '../../socket/index.js'
import { EVENTS } from '../../socket/utils/socket-events.js'

const EXCHANGE = 'notification'

function normalizeRecipients(payload) {
  const recipients = new Set()
  if (Array.isArray(payload.recipients)) payload.recipients.forEach((r) => recipients.add(String(r)))
  if (Array.isArray(payload.userIds)) payload.userIds.forEach((r) => recipients.add(String(r)))
  if (payload.userId) recipients.add(String(payload.userId))
  if (payload.to) recipients.add(String(payload.to))
  if (payload.recipient) recipients.add(String(payload.recipient))
  return Array.from(recipients)
}

function mapPayloadToType(payload) {
  // minimal mapping — expand later if you want specific types
  return payload.type || payload.eventType || 'GENERIC'
}

export async function startNotificationConsumer() {
  const channel = await getChannel()

  // ensure exchange exists
  channel.assertExchange(EXCHANGE, 'topic', { durable: true })

  const queue = 'notification.events'
  await channel.assertQueue(queue, { durable: true })

  // bind a single routing key used for all notification events
  // support both 'notification' and wildcard 'notification.#' just in case
  await channel.bindQueue(queue, EXCHANGE, 'notification')
  await channel.bindQueue(queue, EXCHANGE, 'notification.#')

  console.log('[RabbitMQ] Waiting for notification messages (routingKey: notification...)')

  channel.consume(
    queue,
    async (msg) => {
      if (!msg) return
      try {
        const routingKey = msg.fields.routingKey
        const payload = JSON.parse(msg.content.toString())

        // temporary log for visibility
        console.log('[Notification Consumer] received', routingKey, payload)

        const recipients = normalizeRecipients(payload)
        if (recipients.length === 0) {
          console.log('[Notification Consumer] no recipients found, skipping')
          channel.ack(msg)
          return
        }

        const ntfType = mapPayloadToType(payload)
        const items = recipients.map((userId) => ({
          userId,
          type: ntfType,
          title: payload.title ?? null,
          message: payload.message ?? null,
          metadata: { event: routingKey, payload },
        }))

        // persist notifications (simple, identical handling for all events)
        await notificationService.createNotificationsBulk(items)

        // Emit to connected clients (best-effort). Persist first, then emit.
        try {
          const io = getIO()
          const createdAt = new Date().toISOString()
          for (const item of items) {
            const room = `user:${item.userId}`
            const payloadForClient = {
              type: item.type,
              title: item.title,
              message: item.message,
              metadata: item.metadata,
              createdAt,
            }
            io.to(room).emit(EVENTS.NOTIFICATION, payloadForClient)
          }
          console.log(`[Socket] Emitted notification to ${items.length} recipient(s) for routingKey="${routingKey}"`)
        } catch (emitErr) {
          console.error('⚠️ Failed to emit socket notification (best-effort):', emitErr)
        }

        channel.ack(msg)
      } catch (err) {
        console.error('[RabbitMQ] notification.consumer error', err)
        try {
          channel.ack(msg)
        } catch (e) {
          console.error('Failed to ack msg after error', e)
        }
      }
    },
    { noAck: false }
  )
}

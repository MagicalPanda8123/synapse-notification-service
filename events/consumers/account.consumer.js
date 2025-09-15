import { getChannel } from '../../config/rabbitmq.js'
import { sendNotificationEmail } from '../../utils/mailer.js'

const EXCHANGE = 'account'

export async function startAccountConsumer() {
  const channel = await getChannel()

  // Ensure the exchange exists
  channel.assertExchange(EXCHANGE, 'topic', { durable: true })

  // Create a dedicated queue for notification service
  const queue = 'notification.account'
  await channel.assertQueue(queue, { durable: true })

  // Bind routing keys
  await channel.bindQueue(queue, EXCHANGE, 'account.registered')
  await channel.bindQueue(queue, EXCHANGE, 'account.password.reset.requested')
  await channel.bindQueue(queue, EXCHANGE, 'account.password.changed')

  console.log(`[RabbitMQ] Waiting for account-related messages...`)

  // Consume messages
  channel.consume(queue, async (msg) => {
    if (!msg) return

    try {
      const routingKey = msg.fields.routingKey
      const content = JSON.parse(msg.content.toString())

      console.log(`[RabbitMQ] received message ${routingKey}`, content)

      switch (routingKey) {
        case 'account.registered':
          // send email verification code
          await sendNotificationEmail({
            to: content.email,
            templateName: 'verification-email',
            subject: 'Your Synapse Verification Code',
            templateData: {
              username: content.username || 'friend',
              code: content.code,
            },
          })
          break

        case 'account.password.reset.requested':
          // send password reset code
          await sendNotificationEmail({
            to: content.email,
            templateName: 'password-reset',
            subject: 'Your Synapse Password Reset Code',
            templateData: {
              username: content.username || 'friend',
              code: content.code,
            },
          })
          break

        case 'account.password.changed':
          // send password change notification
          await sendNotificationEmail({
            to: content.email,
            templateName: 'password-changed',
            subject: 'Your Synapse Password Was Changed 🔐🫣',
            templateData: { username: content.username || 'friend' },
          })
          break

        default:
          break
      }

      // ACKNOWLEDGE the message after having processed it successfully
      channel.ack(msg)
    } catch (error) {}
  })
}

import { getChannel } from '../../config/rabbitmq.js'
import { sendVerificationEmail } from '../../utils/mailer.js'

// queue dedicated for sending verification code via email functionality
const QUEUE = 'account.registered.email'

export async function startAccountRegisteredConsumer() {
  const channel = await getChannel()
  await channel.assertQueue(QUEUE, { durable: true })
  channel.prefetch(1)

  channel.consume(
    QUEUE,
    async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString())
          await sendVerificationEmail({
            to: data.email,
            username: data.username,
            code: data.code,
          })
          channel.ack(msg) // manual ack
        } catch (error) {
          console.error('[Consumer] Failed to process message:', error.message)
          /**
           * function signature : channel.nack(msg, allUpTo, requeue)
           * allUpTo (bool), if set to :
           *    false -> only this message is negatively acknowledged.
           *    true -> all unacknowledged messages up to and including this one are negatively acknowledged.
           */
          channel.nack(msg, false, false) // discard only this failed-to-be-processed msg
        }
      }
    },
    { noAck: false }
  )

  console.log(`[Consumer] Listening for "${QUEUE}" messages`)
}

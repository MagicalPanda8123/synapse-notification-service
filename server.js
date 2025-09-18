import 'dotenv/config'
import app from './app.js'
import { getChannel } from './config/rabbitmq.js'
import { startAccountConsumer } from './events/consumers/account.consumer.js'

const PORT = process.env.PORT || 5001

/**
 * Remember that you can use top-level await only with ESM,
 * for CJS -> workaround (wrapping inside an async function)
 */
async function bootstrap() {
  try {
    // Check RabbitMQ connection
    await getChannel()
    // console.log('✅ Connected to RabbitMQ')

    // Start consumers
    await startAccountConsumer()

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(
        `🔔 Notification service running on port ${PORT} (${process.env.NODE_ENV})`
      )
    })
  } catch (err) {
    console.error('❌ Failed to start service:', err)
    process.exit(1)
  }
}

bootstrap()

import 'dotenv/config'
import app from './app.js'
import { startAccountRegisteredConsumer } from './events/consumers/account.consumer.js'

const PORT = process.env.PORT || 5001

// Bootstrapping other services (RabbitMQ)

// Start the consumer
// Remember that you can use top-level await only with ESM, for CJS -> workaround (wrapping inside an async function)
await startAccountRegisteredConsumer()

app.listen(PORT, () => {
  console.log(
    `🔔 Notification service running on port ${PORT} (${process.env.NODE_ENV})`
  )
})

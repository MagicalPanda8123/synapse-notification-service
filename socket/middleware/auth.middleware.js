import { createRemoteJWKSet, jwtVerify } from 'jose'
import cookie from 'cookie'

const JWKS = createRemoteJWKSet(new URL(process.env.AUTH_JWKS_URL), {
  timeoutDuration: 5000,
  cooldownDuration: 30000,
  cacheMaxAge: 300000,
})

export default async function authMiddleware(socket, next) {
  try {
    let token = null

    // Extract token from the handshake headers
    const authHeader = socket.handshake.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    // Extract token from cookies if not in the Authorization header
    if (!token && socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie)
      token = cookies.accessToken // Assuming the cookie is named 'accessToken'
    }

    if (!token) {
      return next(new Error('Authentication error: Missing access token'))
    }

    // Verify the token using the JWKS
    const { payload } = await jwtVerify(token, JWKS)

    // Attach the user payload to the socket object for later use
    socket.user = payload

    // Proceed to the next middleware or connection handler
    next()
  } catch (error) {
    console.error('[Socket Auth] Authentication failed:', error.message)
    next(new Error('Authentication error: Invalid or expired token'))
  }
}

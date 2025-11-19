import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(new URL(process.env.AUTH_JWKS_URL), {
  timeoutDuration: 5000,
  cooldownDuration: 30000,
  cacheMaxAge: 300000,
})

export async function authMiddleware(req, res, next) {
  try {
    let token = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
    // Try to get token from cookie if not in header
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header or access token cookie' })
    }
    const { payload } = await jwtVerify(token, JWKS)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional auth middleware for guest + authenticated users
export async function optionalAuthMiddleware(req, res, next) {
  let token = null
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }
  // Try to get token from cookie if not in header
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken
  }
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const { payload } = await jwtVerify(token, JWKS)
    req.user = payload
    next()
  } catch (error) {
    // Invalid/expired token - continue as guest (don't fail)
    req.user = null
    next()
  }
}

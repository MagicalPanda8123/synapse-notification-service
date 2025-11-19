import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create a notification record.
 * @param {Object} payload
 * @param {string} payload.userId
 * @param {string} payload.type
 * @param {string} [payload.title]
 * @param {string} [payload.message]
 * @param {Object} [payload.metadata]
 * @param {boolean} [payload.isRead=false]
 * @param {PrismaClient|object} [tx] - optional Prisma client/transaction
 * @returns {Promise<Object>} created Notification
 */
export async function createNotification(payload, tx = prisma) {
  const { userId, type, title = null, message = null, metadata = null, isRead = false } = payload

  return tx.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata,
      isRead,
    },
  })
}

/**
 * Create many notifications in bulk (uses createMany).
 * Useful for sending the same notification to multiple users.
 * Note: createMany does not return created rows.
 * @param {Array<Object>} items
 * @param {PrismaClient|object} [tx]
 * @returns {Promise<Object>} result
 */
export async function createNotificationsBulk(items = [], tx = prisma) {
  if (!Array.isArray(items) || items.length === 0) return { count: 0 }
  // normalize items (ensure required fields exist)
  const data = items.map((it) => ({
    userId: it.userId,
    type: it.type,
    title: it.title ?? null,
    message: it.message ?? null,
    metadata: it.metadata ?? null,
    isRead: it.isRead ?? false,
  }))

  return tx.notification.createMany({ data })
}

/**
 * Optional helper: mark a notification as read.
 * @param {string} id
 * @param {PrismaClient|object} [tx]
 * @returns {Promise<Object>} updated Notification
 */
export async function markAsRead(id, tx = prisma) {
  return tx.notification.update({
    where: { id },
    data: { isRead: true },
  })
}

/**
 * Fetch notifications for a user with cursor-based pagination.
 * @param {string} userId
 * @param {Object} [opts]
 * @param {string|null} [opts.cursor] - notification id cursor (exclusive)
 * @param {number} [opts.limit=20] - page size (max 100)
 * @param {boolean} [opts.onlyUnread=false] - filter only unread notifications
 * @returns {Promise<{ items: Array, pagination: { hasMore: boolean, nextCursor: string|null } }>}
 */
export async function findNotificationsByUser(userId, opts = {}) {
  const { cursor = null, limit = 20, onlyUnread = false } = opts
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100)

  const where = { userId: String(userId) }
  if (onlyUnread) where.isRead = false

  const findArgs = {
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      message: true,
      metadata: true,
      isRead: true,
      createdAt: true,
    },
  }

  if (cursor) {
    findArgs.cursor = { id: cursor }
    findArgs.skip = 1
  }

  const rows = await prisma.notification.findMany(findArgs)
  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return { items, pagination: { hasMore, nextCursor } }
}

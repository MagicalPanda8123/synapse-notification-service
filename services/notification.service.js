import { PrismaClient } from '@prisma/client'
import * as repo from '../repositories/notification.repository.js'

const prisma = new PrismaClient()

/**
 * Create a single notification (persists to DB).
 * Uses repository so callers can pass through to tx when needed.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createNotification(payload, tx = null) {
  // basic normalization
  const item = {
    userId: String(payload.userId),
    type: payload.type,
    title: payload.title ?? null,
    message: payload.message ?? null,
    metadata: payload.metadata ?? null,
    isRead: !!payload.isRead,
  }

  return repo.createNotification(item, tx ?? prisma)
}

/**
 * Create notifications in bulk (same schema as repo.createNotificationsBulk)
 * @param {Array<Object>} items
 * @param {object} [tx]
 * @returns {Promise<object>}
 */
export async function createNotificationsBulk(items = [], tx = null) {
  if (!Array.isArray(items) || items.length === 0) return { count: 0 }
  const normalized = items.map((it) => ({
    userId: String(it.userId),
    type: it.type,
    title: it.title ?? null,
    message: it.message ?? null,
    metadata: it.metadata ?? null,
    isRead: !!it.isRead,
  }))

  return repo.createNotificationsBulk(normalized, tx ?? prisma)
}

/**
 * List notifications for a user (cursor-based pagination).
 * @param {string} userId
 * @param {object} options { cursor, limit = 20, onlyUnread = false }
 * @returns {Promise<{ items: Array, pagination: { hasMore, nextCursor } }>}
 */
export async function listNotifications(userId, options = {}) {
  // delegate to repository which implements cursor pagination and filtering
  return repo.findNotificationsByUser(userId, options)
}

/**
 * Mark a single notification as read. Ensures ownership.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object>} updated notification
 */
export async function markAsRead(id, userId) {
  // ensure notification belongs to user
  const existing = await prisma.notification.findUnique({ where: { id } })
  if (!existing) {
    const err = new Error('Notification not found')
    err.status = 404
    throw err
  }
  if (existing.userId !== userId) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }

  return repo.markAsRead(id, prisma)
}

/**
 * Mark all notifications for a user as read.
 * @param {string} userId
 * @returns {Promise<number>} count updated
 */
export async function markAllRead(userId) {
  const res = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
  return res.count
}

/**
 * Get unread count for a user.
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  const count = await prisma.notification.count({ where: { userId, isRead: false } })
  return count
}

// fetch single notification with ownership check
export async function getNotificationById(id, userId) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) {
    const err = new Error('Notification not found')
    err.status = 404
    throw err
  }
  if (String(notification.userId) !== String(userId)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }
  return notification
}

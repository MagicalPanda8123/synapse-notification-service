import * as service from '../services/notification.service.js'

/**
 * GET /notifications?limit=20&cursor=<id>&onlyUnread=true
 */
export async function listNotifications(req, res, next) {
  try {
    const userId = req.user?.sub
    const { cursor = null, limit = 20, onlyUnread = 'false' } = req.query
    const onlyUnreadBool = String(onlyUnread) === 'true'

    const result = await service.listNotifications(userId, {
      cursor,
      limit,
      onlyUnread: onlyUnreadBool,
    })

    return res.json(result)
  } catch (err) {
    return next(err)
  }
}

// Add: GET /notifications/unread/count
export async function unreadCount(req, res, next) {
  try {
    const userId = req.user?.sub
    const count = await service.getUnreadCount(userId)
    return res.json({ unread: count })
  } catch (err) {
    return next(err)
  }
}

// Add: PATCH /notifications/:id/read
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user?.sub
    const { id } = req.params
    const updated = await service.markAsRead(id, userId)
    return res.json(updated)
  } catch (err) {
    return next(err)
  }
}

// Add: PATCH /notifications/read  -> mark all as read
export async function markAllRead(req, res, next) {
  try {
    const userId = req.user?.sub
    const updatedCount = await service.markAllRead(userId)
    return res.json({ updated: updatedCount })
  } catch (err) {
    return next(err)
  }
}

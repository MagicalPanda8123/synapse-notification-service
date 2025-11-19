import express from 'express'
import * as controller from '../controllers/notification.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// GET /notifications?limit=20&cursor=<id>&onlyUnread=true
router.get('/', authMiddleware, controller.listNotifications)

// // GET /notifications/unread/count
router.get('/unread/count', authMiddleware, controller.unreadCount)

// // PATCH /notifications/:id/read
router.patch('/:id/read', authMiddleware, controller.markAsRead)

// // PATCH /notifications/read  -> mark all as read
router.patch('/read', authMiddleware, controller.markAllRead)

export default router

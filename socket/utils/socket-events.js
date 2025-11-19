export const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  POST: {
    CREATED: 'post.created',
    APPROVED: 'post.approved',
    REJECTED: 'post.rejected',
    LOCKED: 'post.locked',
    UNLOCKED: 'post.unlocked',
    REMOVED: 'post.removed',
  },

  COMMENT: {
    CREATED: 'comment.created',
    REPLIED: 'comment.replied',
  },

  JOIN_REQUEST: {
    CREATED: 'joinRequest.created',
    APPROVED: 'joinRequest.approved',
    REJECTED: 'joinRequest.rejected',
  },

  MEMBERSHIP: {
    MOD_PROMOTED: 'moderator.promoted',
    MOD_DEMOTED: 'moderator.demoted',
    BANNED: 'member.banned',
    UNBANNED: 'member.unbanned',
  },
}

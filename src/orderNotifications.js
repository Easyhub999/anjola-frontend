export const notificationLabels = {
  order_confirmation: 'Order confirmation', payment_confirmation: 'Payment receipt',
  payment_review: 'Payment review', shipped: 'Shipping update', delivered: 'Delivery confirmation',
  cancelled: 'Cancellation confirmation'
};

export const notificationStatusLabels = {
  pending: 'Queued', sending: 'Sending', retry: 'Retry scheduled', sent: 'Sent · awaiting delivery',
  delivered: 'Delivered', delayed: 'Delivery delayed', failed: 'Failed', bounced: 'Bounced',
  suppressed: 'Sending blocked', complained: 'Marked as spam', skipped: 'Skipped', uncertain: 'Needs review'
};

export const notificationsOf = order => Array.isArray(order.notifications) ? order.notifications : [];
export const EMAIL_DELIVERY_OVERDUE_MS = 30 * 60 * 1000;
export const EMAIL_SEND_OVERDUE_MS = 5 * 60 * 1000;

const firstRecordedTime = (...values) => values.map(value => Date.parse(value)).find(Number.isFinite);

export function notificationNeedsAttention(notification, now = Date.now()) {
  if (['failed', 'bounced', 'suppressed', 'complained', 'uncertain', 'delayed'].includes(notification.status)) return true;
  let since;
  if (notification.status === 'sent') {
    since = firstRecordedTime(notification.sentAt, notification.lastAttemptAt);
    return Number.isFinite(since) && now - since > EMAIL_DELIVERY_OVERDUE_MS;
  }
  if (notification.status === 'pending') since = firstRecordedTime(notification.nextAttemptAt, notification.createdAt);
  else if (notification.status === 'sending') since = firstRecordedTime(notification.lastAttemptAt);
  else if (notification.status === 'retry') since = firstRecordedTime(notification.nextAttemptAt);
  return Number.isFinite(since) && now - since > EMAIL_SEND_OVERDUE_MS;
}

export const needsEmailAttention = order => notificationsOf(order).some(notification => notificationNeedsAttention(notification));

export function notificationUpdateText(order, type) {
  const notification = [...notificationsOf(order)].reverse().find(entry => entry.type === type);
  if (!notification) return '';
  if (['pending', 'sending', 'retry'].includes(notification.status)) return ' Customer email queued. Check Customer emails for delivery updates.';
  if (notification.status === 'skipped') return ' Customer email was skipped. Check Customer emails for the reason.';
  if (notification.status === 'delivered') return ' Customer email delivered.';
  if (notification.status === 'sent') return ' Customer email sent; delivery confirmation is pending.';
  return ' Check Customer emails for its delivery status.';
}

import { EMAIL_DELIVERY_OVERDUE_MS, EMAIL_SEND_OVERDUE_MS, notificationNeedsAttention } from './orderNotifications';

const now = Date.parse('2026-10-18T12:00:00Z');
const ago = milliseconds => new Date(now - milliseconds).toISOString();

test('accepted email becomes overdue after thirty minutes without claiming delivery failed', () => {
  const notification = { status: 'sent', sentAt: ago(EMAIL_DELIVERY_OVERDUE_MS) };
  expect(notificationNeedsAttention(notification, now)).toBe(false);
  expect(notificationNeedsAttention(notification, now + 1)).toBe(true);
  expect(notification.status).toBe('sent');
  expect(notificationNeedsAttention({ status: 'sent', lastAttemptAt: ago(EMAIL_DELIVERY_OVERDUE_MS + 1) }, now)).toBe(true);
  expect(notificationNeedsAttention({ status: 'delivered', sentAt: ago(EMAIL_DELIVERY_OVERDUE_MS + 1) }, now)).toBe(false);
});

test('queued and sending emails are flagged after five minutes', () => {
  for (const notification of [
    { status: 'pending', createdAt: ago(EMAIL_SEND_OVERDUE_MS) },
    { status: 'pending', nextAttemptAt: ago(EMAIL_SEND_OVERDUE_MS) },
    { status: 'sending', lastAttemptAt: ago(EMAIL_SEND_OVERDUE_MS) }
  ]) {
    expect(notificationNeedsAttention(notification, now)).toBe(false);
    expect(notificationNeedsAttention(notification, now + 1)).toBe(true);
  }
});

test('scheduled retries use their due time and do not flag a legitimate wait', () => {
  const old = ago(60 * 60 * 1000);
  for (const status of ['pending', 'retry']) {
    expect(notificationNeedsAttention({ status, createdAt: old, lastAttemptAt: old, nextAttemptAt: ago(-60000) }, now)).toBe(false);
    expect(notificationNeedsAttention({ status, createdAt: old, nextAttemptAt: ago(EMAIL_SEND_OVERDUE_MS) }, now)).toBe(false);
    expect(notificationNeedsAttention({ status, nextAttemptAt: ago(EMAIL_SEND_OVERDUE_MS + 1) }, now)).toBe(true);
  }
});

test('missing or malformed dates do not invent overdue delivery evidence', () => {
  for (const status of ['sent', 'pending', 'sending', 'retry', 'skipped']) {
    expect(notificationNeedsAttention({ status }, now)).toBe(false);
    expect(notificationNeedsAttention({ status, sentAt: 'invalid', lastAttemptAt: 'invalid', createdAt: 'invalid', nextAttemptAt: 'invalid' }, now)).toBe(false);
  }
  expect(notificationNeedsAttention({ status: 'sent', sentAt: 'invalid', lastAttemptAt: ago(EMAIL_DELIVERY_OVERDUE_MS + 1) }, now)).toBe(true);
});

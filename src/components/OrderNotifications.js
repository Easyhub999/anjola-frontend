import { useCallback, useEffect, useRef, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { ordersAPI } from '../api';
import { notificationLabels, notificationStatusLabels, notificationsOf, notificationNeedsAttention } from '../orderNotifications';

const timestamp = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
const sendLabels = { order_confirmation: 'order confirmation', payment_confirmation: 'payment receipt', payment_review: 'payment review', shipped: 'shipping', delivered: 'delivery confirmation', cancelled: 'cancellation' };

export default function OrderNotifications({ order, token, disabled, onBusyChange, onOrderChanged, onNotificationsChanged }) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmType, setConfirmType] = useState(null);
  const [working, setWorking] = useState(false);
  const [emailPreference, setEmailPreference] = useState(order.sendCustomerEmail === true);
  const active = useRef(false);
  const mutation = useRef(false);
  const externallyBusy = useRef(disabled);
  const fetchInProgress = useRef(false);
  const version = useRef(0);
  const controller = useRef(null);
  const confirmation = useRef(null);
  const notifications = notificationsOf(order);
  const hasAddress = Boolean(order.customerInfo?.email?.trim());
  const optedOut = order.isManualOrder && order.sendCustomerEmail !== true;
  const eligible = [];
  if (order.status === 'pending' && order.paymentStatus !== 'paid') eligible.push('order_confirmation');
  if (order.paymentStatus === 'paid') eligible.push(order.paymentReviewReason ? 'payment_review' : 'payment_confirmation');
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) eligible.push(order.status);
  const missing = eligible.filter(type => !notifications.some(notification => notification.type === type));

  const refresh = useCallback(async () => {
    if (!active.current || mutation.current || externallyBusy.current || fetchInProgress.current || document.visibilityState === 'hidden') return;
    const request = version.current;
    fetchInProgress.current = true;
    controller.current = new AbortController();
    setRefreshing(true);
    try {
      const response = await ordersAPI.getOrderNotifications(order._id, token, { signal: controller.current.signal });
      if (!Array.isArray(response?.data)) throw new Error('Unable to read email history. Please refresh.');
      if (active.current && request === version.current) {
        onNotificationsChanged(order._id, response.data);
        setError('');
      }
    } catch (err) {
      if (active.current && request === version.current && err.name !== 'AbortError') setError(err.status === 401 ? 'Your session has expired. Sign in again to check emails.' : err.message || 'Unable to refresh email history.');
    } finally {
      fetchInProgress.current = false;
      if (active.current) setRefreshing(false);
    }
  }, [order._id, token, onNotificationsChanged]);

  useEffect(() => {
    active.current = true;
    refresh();
    const interval = setInterval(refresh, 10000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active.current = false;
      version.current += 1;
      controller.current?.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  useEffect(() => { if (confirmType) confirmation.current?.querySelector('button')?.focus(); }, [confirmType]);
  useEffect(() => { setEmailPreference(order.sendCustomerEmail === true); }, [order.sendCustomerEmail]);
  useEffect(() => {
    externallyBusy.current = disabled;
    if (disabled) { version.current += 1; controller.current?.abort(); }
    else refresh();
  }, [disabled, refresh]);

  const send = async (type, notificationId, preference) => {
    if (mutation.current || disabled) return;
    mutation.current = true;
    version.current += 1;
    controller.current?.abort();
    setWorking(true); onBusyChange(true); setError(''); setFeedback('');
    try {
      const response = await (typeof preference === 'boolean' ? ordersAPI.updateNotificationPreferences(order._id, preference, token) : notificationId ? ordersAPI.retryNotification(order._id, notificationId, token) : ordersAPI.sendOrderNotification(order._id, type, token));
      if (!response?.data || response.data._id !== order._id) throw new Error('The email request could not be confirmed. Refresh email history before trying again.');
      if (active.current) {
        onOrderChanged(order._id, response.data);
        setConfirmType(null);
        setFeedback(typeof preference === 'boolean' ? 'Email preference saved. Earlier emails have not been sent.' : 'Email queued. Delivery updates will appear here.');
      }
    } catch (err) {
      if (active.current) setError(err.status === 401 ? 'Your session has expired. Sign in again to send emails.' : err.message || 'Unable to queue this email. Please refresh its status before trying again.');
    } finally {
      mutation.current = false;
      if (active.current) { setWorking(false); onBusyChange(false); }
    }
  };

  return <section className="ao-section ao-emails" aria-labelledby="ao-emails-title">
    <div className="ao-section-heading"><h3 id="ao-emails-title"><Mail size={19} />Customer emails</h3><button className="ao-text-button" onClick={refresh} disabled={refreshing || disabled || working}><RefreshCw size={14} className={refreshing ? 'ao-spin' : ''} />Refresh emails</button></div>
    <p className="ao-muted ao-email-intro">Sent means the email service accepted the message. Delivered confirms the customer’s mail server accepted it; it may still go to spam.</p>
    {!hasAddress && <p className="ao-notice ao-warning">No customer email address is recorded for this order.</p>}
    {optedOut && <p className="ao-notice ao-warning">Customer emails are off for this manual order.</p>}
    {order.isManualOrder && <div className="ao-email-preference"><label><input type="checkbox" checked={emailPreference} disabled={disabled || working || !hasAddress} onChange={event => setEmailPreference(event.target.checked)} />Send order updates to the customer</label><p>Applies to future order updates. Saving this preference does not send earlier emails.</p><button className="ao-secondary" disabled={disabled || working || emailPreference === (order.sendCustomerEmail === true) || (emailPreference && !hasAddress)} onClick={() => send(null, null, emailPreference)}>Save email preference</button></div>}
    {notifications.length ? <ul className="ao-email-history">{notifications.map(notification => <li key={notification.id}>
      <div className="ao-email-row"><strong>{notificationLabels[notification.type] || 'Order update'}</strong><span className={`ao-email-status ao-email-status--${Object.hasOwn(notificationStatusLabels, notification.status) ? notification.status : 'unknown'}`}>{notificationStatusLabels[notification.status] || 'Status unavailable'}</span></div>
      <p className="ao-muted">{timestamp(notification.deliveredAt || notification.sentAt || notification.lastAttemptAt || notification.createdAt) || 'Time not recorded'}{notification.attempts > 0 ? ` · ${notification.attempts} ${notification.attempts === 1 ? 'attempt' : 'attempts'}` : ''}</p>
      {notification.status === 'retry' && notification.nextAttemptAt && <p>Next attempt: {timestamp(notification.nextAttemptAt) || 'Scheduled shortly'}</p>}
      {notification.status === 'sent' && notificationNeedsAttention(notification) && <p className="ao-email-overdue">Delivery confirmation is overdue. Check the email service’s activity.</p>}
      {['pending', 'sending', 'retry'].includes(notification.status) && notificationNeedsAttention(notification) && <p className="ao-email-overdue">This email is taking longer than expected. Refresh or check email sending.</p>}
      {notification.status === 'skipped' && <p>{notification.skipReason || 'An email was not requested for this update.'}</p>}
      {notification.lastError && !['sent', 'delivered'].includes(notification.status) && <p className="ao-email-reason">{notification.lastError}</p>}
      {notification.status === 'uncertain' && <p>Check the email service’s activity before sending another message. The previous attempt may have been received.</p>}
      {notification.status === 'bounced' && <p>The customer’s mail server rejected this email. Confirm the address with the customer.</p>}
      {notification.canRetry && <button className="ao-secondary" disabled={disabled || working} onClick={() => send(notification.type, notification.id)} aria-label={`Retry ${notificationLabels[notification.type]?.toLowerCase() || 'order update'} email`}>{working ? 'Queuing…' : 'Retry email'}</button>}
    </li>)}</ul> : <p className="ao-muted">{refreshing ? 'Checking email history…' : 'No email history is recorded. Earlier emails may have been sent before delivery tracking was available.'}</p>}
    {hasAddress && !optedOut && missing.length > 0 && <div className="ao-email-recovery"><h4>Send an email without recorded history</h4><p>Check whether the customer already received it before sending, to avoid duplicates.</p><div className="ao-email-actions">{missing.map(type => <button key={type} className="ao-secondary" disabled={disabled || working || Boolean(confirmType)} onClick={() => { setConfirmType(type); setFeedback(''); }}>Send {sendLabels[type]} email</button>)}</div></div>}
    {confirmType && <div ref={confirmation} className="ao-email-confirm" role="group" aria-label="Confirm email send"><h4>Send {sendLabels[confirmType]} email?</h4><p>This will send to {order.customerInfo?.email}. An earlier email may already have arrived.</p><div className="ao-email-actions"><button className="ao-secondary" disabled={working} onClick={() => setConfirmType(null)}>Keep as is</button><button className="ao-primary" disabled={disabled || working} onClick={() => send(confirmType)}>{working ? 'Queuing…' : 'Confirm send'}</button></div></div>}
    {feedback && <p role="status" className="ao-notice ao-success">{feedback}</p>}
    {error && <p role="alert" className="ao-notice ao-error">{error}</p>}
  </section>;
}

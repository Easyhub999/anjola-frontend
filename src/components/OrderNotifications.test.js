import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderNotifications from './OrderNotifications';
import { ordersAPI } from '../api';

jest.mock('../api', () => ({ ordersAPI: { getOrderNotifications: jest.fn(), retryNotification: jest.fn(), sendOrderNotification: jest.fn(), updateNotificationPreferences: jest.fn() } }));
const baseOrder = { _id: 'order1', status: 'shipped', paymentStatus: 'paid', customerInfo: { email: 'ada@example.test' }, notifications: [] };
const props = () => ({ order: baseOrder, token: 'token', disabled: false, onBusyChange: jest.fn(), onOrderChanged: jest.fn(), onNotificationsChanged: jest.fn() });
beforeEach(() => { jest.resetAllMocks(); jest.useFakeTimers(); ordersAPI.getOrderNotifications.mockResolvedValue({ data: [] }); });
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('email polling pauses in hidden tabs, refreshes on return and stops after closing', async () => {
  const args = props();
  const visible = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  const view = render(<OrderNotifications {...args} />);
  await act(async () => {});
  expect(ordersAPI.getOrderNotifications).toHaveBeenCalledTimes(1);
  await act(async () => { jest.advanceTimersByTime(10000); });
  expect(ordersAPI.getOrderNotifications).toHaveBeenCalledTimes(2);
  visible.mockReturnValue('hidden');
  await act(async () => { jest.advanceTimersByTime(20000); });
  expect(ordersAPI.getOrderNotifications).toHaveBeenCalledTimes(2);
  visible.mockReturnValue('visible');
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(ordersAPI.getOrderNotifications).toHaveBeenCalledTimes(3);
  view.unmount();
  await act(async () => { jest.advanceTimersByTime(20000); });
  expect(ordersAPI.getOrderNotifications).toHaveBeenCalledTimes(3);
});

test('a pending refresh cannot overwrite an email retry or update a closed drawer', async () => {
  let resolve;
  ordersAPI.getOrderNotifications.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const args = props();
  args.order = { ...baseOrder, notifications: [{ id: 'email1', type: 'shipped', status: 'failed', canRetry: true }] };
  ordersAPI.retryNotification.mockResolvedValue({ data: { ...baseOrder, notifications: [{ id: 'email1', type: 'shipped', status: 'pending' }] } });
  const view = render(<OrderNotifications {...args} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry shipping update email' })); });
  await act(async () => { resolve({ data: [{ id: 'email1', type: 'shipped', status: 'failed' }] }); });
  expect(args.onNotificationsChanged).not.toHaveBeenCalled();
  expect(args.onOrderChanged).toHaveBeenCalledTimes(1);
  ordersAPI.getOrderNotifications.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  fireEvent.click(screen.getByRole('button', { name: 'Refresh emails' }));
  view.unmount();
  await act(async () => { resolve({ data: [] }); });
  expect(args.onNotificationsChanged).not.toHaveBeenCalled();
});

test('uncertain, bounced and suppressed emails remain visible without unsafe retry controls', async () => {
  const args = props();
  args.order = { ...baseOrder, notifications: [
    { id: 'email1', type: 'shipped', status: 'uncertain', canRetry: false },
    { id: 'email2', type: 'payment_confirmation', status: 'bounced', canRetry: false },
    { id: 'email3', type: 'order_confirmation', status: 'suppressed', canRetry: false }
  ] };
  render(<OrderNotifications {...args} />);
  await act(async () => {});
  expect(screen.getByText('Needs review')).toBeInTheDocument();
  expect(screen.getByText('Bounced')).toBeInTheDocument();
  expect(screen.getByText('Sending blocked')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Send .* email/ })).not.toBeInTheDocument();
});

test('overdue emails explain the delay and never offer a duplicate send', async () => {
  jest.setSystemTime(new Date('2026-10-18T12:00:00Z'));
  const args = props();
  args.order = { ...baseOrder, notifications: [
    { id: 'email1', type: 'shipped', status: 'sent', sentAt: '2026-10-18T11:29:59Z', canRetry: false },
    { id: 'email2', type: 'payment_confirmation', status: 'pending', createdAt: '2026-10-18T11:54:59Z', canRetry: false }
  ] };
  render(<OrderNotifications {...args} />);
  await act(async () => {});
  expect(screen.getByText('Delivery confirmation is overdue. Check the email service’s activity.')).toBeInTheDocument();
  expect(screen.getByText('This email is taking longer than expected. Refresh or check email sending.')).toBeInTheDocument();
  expect(screen.getByText('Sent · awaiting delivery')).toBeInTheDocument();
  expect(screen.getByText('Queued')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Send .* email/ })).not.toBeInTheDocument();
});

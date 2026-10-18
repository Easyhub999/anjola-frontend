import { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AdminOrdersPage from './AdminOrdersPage';
import { ordersAPI } from '../api';

jest.mock('../api', () => ({ ordersAPI: { getAllOrders: jest.fn(), updateOrderStatus: jest.fn(), recordPayment: jest.fn(), getOrderNotifications: jest.fn(), retryNotification: jest.fn(), sendOrderNotification: jest.fn(), updateNotificationPreferences: jest.fn() } }));
const admin = { role: 'admin', token: 'test-token' };
const order = { _id: 'order1', orderNumber: 'ANJ-101', status: 'processing', paymentStatus: 'paid', totalAmount: 12000,
  stockDeducted: true, createdAt: '2026-10-14T12:00:00Z', customerInfo: { fullName: 'Ada Williams', email: 'ada@example.test', address: '12 Example Street', city: 'Lagos', state: 'Lagos', phone: '08000000000' },
  items: [{ name: 'Tote bag', price: 6000, quantity: 2 }] };
async function openOrder(overrides = {}) {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, ...overrides }] });
  ordersAPI.getOrderNotifications.mockResolvedValue({ data: overrides.notifications || [] });
  render(<AdminOrdersPage user={admin} />);
  const view = await screen.findByRole('button', { name: 'View order ANJ-101' });
  await act(async () => { fireEvent.click(view); });
  return screen.getByRole('dialog');
}
beforeEach(() => { jest.resetAllMocks(); ordersAPI.getOrderNotifications.mockResolvedValue({ data: [] }); });
afterEach(() => jest.restoreAllMocks());

test('search combines with payment and fulfilment filters, and clear restores newest-first results', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [order,
    { ...order, _id: 'order2', orderNumber: 'ANJ-102', status: 'pending', paymentStatus: 'pending', createdAt: '2026-10-15T12:00:00Z' },
    { ...order, _id: 'order3', orderNumber: 'ANJ-103', customerInfo: { fullName: 'Bisi', email: 'bisi@example.test' } }
  ] });
  render(<AdminOrdersPage user={admin} />);
  await screen.findByRole('button', { name: 'View order ANJ-101' });
  expect(screen.getAllByRole('button', { name: /View order/ })[0]).toHaveAccessibleName('View order ANJ-102');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ADA@EXAMPLE.TEST' } });
  fireEvent.change(screen.getByLabelText('Payment'), { target: { value: 'paid' } });
  fireEvent.change(screen.getByLabelText('Fulfilment'), { target: { value: 'processing' } });
  expect(screen.getAllByRole('button', { name: /View order/ })).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'View order ANJ-101' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'No such customer' } });
  expect(screen.getByText('No matching orders')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getAllByRole('button', { name: /View order/ })).toHaveLength(3);
});

test('queues exclude cancelled unpaid orders and show only paid orders to prepare', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [order,
    { ...order, _id: 'order2', orderNumber: 'ANJ-102', status: 'pending', paymentStatus: 'pending' },
    { ...order, _id: 'order3', orderNumber: 'ANJ-103', status: 'cancelled', paymentStatus: 'pending' }
  ] });
  render(<AdminOrdersPage user={admin} />);
  await screen.findByRole('button', { name: 'View order ANJ-101' });
  fireEvent.click(screen.getByRole('button', { name: /Awaiting payment 1/ }));
  expect(screen.getAllByRole('button', { name: /View order/ })).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'View order ANJ-102' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /To prepare 1/ }));
  expect(screen.getByRole('button', { name: 'View order ANJ-101' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'View order ANJ-102' })).not.toBeInTheDocument();
});

test('pagination exposes all orders and a new search returns to the first page', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: Array.from({ length: 21 }, (_, index) => ({ ...order, _id: `order${index}`, orderNumber: `ANJ-${index}` })) });
  render(<AdminOrdersPage user={admin} />);
  await screen.findByRole('button', { name: 'View order ANJ-0' });
  expect(screen.getAllByRole('button', { name: /View order/ })).toHaveLength(20);
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByRole('button', { name: 'View order ANJ-20' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ANJ-0' } });
  expect(screen.getByRole('button', { name: 'View order ANJ-0' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
});

test('drawer traps keyboard focus, makes background inert and restores it on close', async () => {
  const dialog = await openOrder();
  const close = within(dialog).getByRole('button', { name: 'Close order details' });
  expect(close).toHaveFocus();
  expect(screen.getByRole('main').parentElement).toHaveAttribute('inert');
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
  expect(within(dialog).getByRole('button', { name: 'Send payment receipt email' })).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('main').parentElement).not.toHaveAttribute('inert');
});

test('cancellation requires confirmation and keeps the order when declined', async () => {
  const dialog = await openOrder();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel order' }));
  expect(screen.getByText(/Recorded deducted stock will be restored/)).toBeInTheDocument();
  expect(screen.getByText(/Cancellation does not issue a refund/)).toBeInTheDocument();
  expect(ordersAPI.updateOrderStatus).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep order' }));
  expect(screen.queryByRole('button', { name: 'Confirm cancellation' })).not.toBeInTheDocument();
  ordersAPI.updateOrderStatus.mockResolvedValueOnce({ data: { ...order, status: 'cancelled', stockDeducted: false } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel order' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
  await waitFor(() => expect(ordersAPI.updateOrderStatus).toHaveBeenCalledWith('order1', { status: 'cancelled' }, 'test-token'));
  expect(await screen.findByText('Order marked as cancelled.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Mark as shipped' })).not.toBeInTheDocument();
});

test.each([
  { paymentStatus: 'pending' }, { paymentReviewReason: 'Amount mismatch' }, { inventoryReviewReason: 'Check stock manually' }
])('fulfilment is blocked for unpaid or review-required orders (%p)', async overrides => {
  const dialog = await openOrder(overrides);
  expect(within(dialog).getByRole('button', { name: 'Mark as shipped' })).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Cancel order' })).toBeEnabled();
  expect(ordersAPI.updateOrderStatus).not.toHaveBeenCalled();
});

test('a failed update keeps details and tracking intact so the owner can retry', async () => {
  await openOrder();
  ordersAPI.updateOrderStatus.mockRejectedValueOnce(new Error('Connection lost'));
  fireEvent.change(screen.getByLabelText(/Tracking number/), { target: { value: ' TRACK-42 ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Mark as shipped' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
  expect(screen.getByLabelText(/Tracking number/)).toHaveValue(' TRACK-42 ');
  expect(screen.getByRole('button', { name: 'Mark as shipped' })).toBeEnabled();
  expect(ordersAPI.updateOrderStatus).toHaveBeenCalledWith('order1', { status: 'shipped', trackingNumber: 'TRACK-42' }, 'test-token');
});

test('pending updates prevent duplicate submissions and accidental drawer dismissal', async () => {
  let resolve;
  ordersAPI.updateOrderStatus.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  await openOrder();
  const submit = screen.getByRole('button', { name: 'Mark as shipped' });
  fireEvent.click(submit); fireEvent.click(submit);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close order details' })).toBeDisabled();
  expect(ordersAPI.updateOrderStatus).toHaveBeenCalledTimes(1);
  await act(async () => resolve({ data: { ...order, status: 'shipped' } }));
  expect(screen.getByRole('button', { name: 'Mark as delivered' })).toBeEnabled();
});

test('copy failure gives honest feedback', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: jest.fn().mockRejectedValue(new Error('Denied')) } });
  await openOrder();
  fireEvent.click(screen.getByRole('button', { name: 'Copy address' }));
  expect(await screen.findByText(/Could not copy address/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close order details' }));
});

test('missing customer and total fields remain safe to inspect', async () => {
  const dialog = await openOrder({ customerInfo: null, totalAmount: null });
  expect(within(dialog).getByText('Name not recorded')).toBeInTheDocument();
  expect(within(dialog).getByText('Address not recorded')).toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: 'Copy address' })).not.toBeInTheDocument();
});

test('non-admins never fetch orders', () => {
  render(<AdminOrdersPage user={{ role: 'user', token: 'token' }} />);
  expect(screen.getByText('Access denied')).toBeInTheDocument();
  expect(ordersAPI.getAllOrders).not.toHaveBeenCalled();
});

test.each([[2000, '₦2,000'], [1500, '₦1,500'], [0, '₦0'], [undefined, 'Not recorded']])('admin displays the saved packaging charge without repricing old orders (%p)', async (fee, expected) => {
  const dialog = await openOrder({ customerInfo: { ...order.customerInfo, isGift: true, giftPackagingFee: fee } });
  expect(within(dialog).getByText('Gift packaging').parentElement).toHaveTextContent(expected);
});


test('outside orders show source and record payment through the admin payment endpoint', async () => {
  const initial = { ...order, isManualOrder: true, orderSource: 'whatsapp', internalNotes: 'Call first', paymentStatus: 'pending', status: 'pending', stockDeducted: false };
  ordersAPI.recordPayment.mockResolvedValue({ data: { ...initial, paymentStatus: 'paid', status: 'processing', stockDeducted: true } });
  await openOrder(initial);
  expect(screen.getByText('Source: WhatsApp')).toBeInTheDocument();
  expect(screen.getByText('Call first')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm payment received' }));
  await screen.findByText('Payment recorded. Stock updated and order ready to prepare.');
  expect(ordersAPI.recordPayment).toHaveBeenCalledWith('order1', { paymentMethod: 'bank_transfer', paymentReference: '' }, 'test-token');
  expect(screen.queryByRole('button', { name: 'Confirm payment received' })).not.toBeInTheDocument();
});

test('failed shipping emails are visible and retry without changing fulfilment', async () => {
  const failed = { id: 'email1', type: 'shipped', status: 'failed', attempts: 2, canRetry: true, lastError: 'Email service temporarily unavailable.' };
  const initial = { ...order, status: 'shipped', notifications: [failed] };
  const queued = { ...initial, notifications: [{ ...failed, status: 'pending', canRetry: false }] };
  ordersAPI.retryNotification.mockResolvedValue({ data: queued });
  await openOrder(initial);
  expect(screen.getByText('1 order has emails that need attention.')).toBeInTheDocument();
  expect(screen.getByText('Email service temporarily unavailable.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry shipping update email' }));
  expect(await screen.findByText('Email queued. Delivery updates will appear here.')).toBeInTheDocument();
  expect(ordersAPI.retryNotification).toHaveBeenCalledWith('order1', 'email1', 'test-token');
  expect(ordersAPI.updateOrderStatus).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Mark as delivered' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Retry shipping update email' })).not.toBeInTheDocument();
  expect(screen.queryByText('1 order has emails that need attention.')).not.toBeInTheDocument();
});

test('provider acceptance is distinct from delivery and accepted emails cannot be resent', async () => {
  await openOrder({ status: 'shipped', notifications: [
    { id: 'email1', type: 'shipped', status: 'sent', canRetry: false },
    { id: 'email2', type: 'payment_confirmation', status: 'delivered', canRetry: false }
  ] });
  expect(screen.getByText('Sent · awaiting delivery')).toBeInTheDocument();
  expect(screen.getByText(/Delivered confirms the customer’s mail server accepted it/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Retry .* email/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send shipping email' })).not.toBeInTheDocument();
  expect(ordersAPI.sendOrderNotification).not.toHaveBeenCalled();
});

test('legacy shipping email requires explicit confirmation and prevents duplicate submissions', async () => {
  let resolve;
  ordersAPI.sendOrderNotification.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  await openOrder({ status: 'shipped' });
  fireEvent.click(screen.getByRole('button', { name: 'Send shipping email' }));
  expect(screen.getByText(/An earlier email may already have arrived/)).toBeInTheDocument();
  expect(ordersAPI.sendOrderNotification).not.toHaveBeenCalled();
  const submit = screen.getByRole('button', { name: 'Confirm send' });
  fireEvent.click(submit); fireEvent.click(submit);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close order details' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mark as delivered' })).toBeDisabled();
  expect(ordersAPI.sendOrderNotification).toHaveBeenCalledTimes(1);
  expect(ordersAPI.sendOrderNotification).toHaveBeenCalledWith('order1', 'shipped', 'test-token');
  await act(async () => resolve({ data: { ...order, status: 'shipped', notifications: [{ id: 'email1', type: 'shipped', status: 'pending', canRetry: false }] } }));
  expect(screen.getByText('Email queued. Delivery updates will appear here.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send shipping email' })).not.toBeInTheDocument();
});

test('marking shipped truthfully reports an email queued for delivery', async () => {
  await openOrder();
  const notifications = [{ id: 'email1', type: 'shipped', status: 'pending', canRetry: false }];
  ordersAPI.updateOrderStatus.mockResolvedValueOnce({ data: { ...order, status: 'shipped', notifications } });
  ordersAPI.getOrderNotifications.mockResolvedValue({ data: notifications });
  fireEvent.click(screen.getByRole('button', { name: 'Mark as shipped' }));
  expect(await screen.findByText('Order marked as shipped. Customer email queued. Check Customer emails for delivery updates.')).toBeInTheDocument();
  expect(screen.queryByText('Customer email delivered.')).not.toBeInTheDocument();
});

test('email attention summary filters orders and includes delayed delivery', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [order, { ...order, _id: 'order2', orderNumber: 'ANJ-102', notifications: [{ id: 'email2', type: 'shipped', status: 'delayed', canRetry: false }] }] });
  render(<AdminOrdersPage user={admin} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Review emails' }));
  expect(screen.getByRole('button', { name: 'View order ANJ-102' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'View order ANJ-101' })).not.toBeInTheDocument();
  expect(screen.getByText('1 order · Emails needing attention')).toBeInTheDocument();
});

test('manual email preference is explicitly saved without sending old notifications', async () => {
  const initial = { ...order, isManualOrder: true, sendCustomerEmail: false, notifications: [{ id: 'email1', type: 'payment_confirmation', status: 'skipped', skipReason: 'Customer emails were turned off.', canRetry: false }] };
  ordersAPI.updateNotificationPreferences.mockResolvedValue({ data: { ...initial, sendCustomerEmail: true, notifications: [{ ...initial.notifications[0], canRetry: true }] } });
  await openOrder(initial);
  expect(screen.getByText('Customer emails were turned off.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send payment receipt email' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Send order updates to the customer'));
  expect(ordersAPI.updateNotificationPreferences).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save email preference' }));
  expect(await screen.findByText('Email preference saved. Earlier emails have not been sent.')).toBeInTheDocument();
  expect(ordersAPI.updateNotificationPreferences).toHaveBeenCalledWith('order1', true, 'test-token');
  expect(ordersAPI.sendOrderNotification).not.toHaveBeenCalled();
  expect(ordersAPI.retryNotification).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Retry payment receipt email' })).toBeInTheDocument();
});

test('missing sending and delivery configuration are visible to the admin', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [order], notificationHealth: { sendingConfigured: false, deliveryTrackingConfigured: false } });
  render(<AdminOrdersPage user={admin} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Customer email sending needs setup.');
  expect(screen.getByRole('alert')).toHaveTextContent('Saved emails will stay queued until it is ready.');
  expect(screen.getByRole('alert')).toHaveTextContent('Delivery tracking needs setup.');
});

test('the visible order list raises attention when delivery confirmation becomes overdue', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-18T12:00:00Z'));
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, notifications: [{ id: 'email1', type: 'shipped', status: 'sent', sentAt: '2026-10-18T11:30:30Z', canRetry: false }] }] });
  const view = render(<AdminOrdersPage user={admin} />);
  try {
    await act(async () => {});
    expect(screen.queryByRole('button', { name: 'Review emails' })).not.toBeInTheDocument();
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(screen.getByText('1 order has emails that need attention.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review emails' }));
    expect(screen.getByRole('button', { name: 'View order ANJ-101' })).toBeInTheDocument();
    expect(ordersAPI.getAllOrders).toHaveBeenCalledTimes(1);
  } finally { view.unmount(); jest.useRealTimers(); }
});

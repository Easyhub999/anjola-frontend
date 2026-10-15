import { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AdminOrdersPage from './AdminOrdersPage';
import { ordersAPI } from '../api';

jest.mock('../api', () => ({ ordersAPI: { getAllOrders: jest.fn(), updateOrderStatus: jest.fn() } }));
const admin = { role: 'admin', token: 'test-token' };
const order = { _id: 'order1', orderNumber: 'ANJ-101', status: 'processing', paymentStatus: 'paid', totalAmount: 12000,
  stockDeducted: true, createdAt: '2026-10-14T12:00:00Z', customerInfo: { fullName: 'Ada Williams', email: 'ada@example.test', address: '12 Example Street', city: 'Lagos', state: 'Lagos', phone: '08000000000' },
  items: [{ name: 'Tote bag', price: 6000, quantity: 2 }] };
async function openOrder(overrides = {}) {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, ...overrides }] });
  render(<AdminOrdersPage user={admin} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View order ANJ-101' }));
  return screen.getByRole('dialog');
}
beforeEach(() => jest.resetAllMocks());
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
  expect(within(dialog).getByRole('button', { name: 'Cancel order' })).toHaveFocus();
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

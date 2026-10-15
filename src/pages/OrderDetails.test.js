import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import AdminOrdersPage from './AdminOrdersPage';
import CheckoutPage from './CheckoutPage';
import { ordersAPI, paymentsAPI } from '../api';

jest.mock('../api', () => ({
  authAPI: { logout: jest.fn() },
  ordersAPI: { getMyOrders: jest.fn(), getAllOrders: jest.fn(), updateOrderStatus: jest.fn(), createOrder: jest.fn() },
  paymentsAPI: { initializePayment: jest.fn() }
}));

const user = { name: 'Test', email: 'test@example.com', token: 'token', role: 'user' };
const order = { _id: 'order1', orderNumber: 'ANJ-123', status: 'processing', paymentStatus: 'paid',
  totalAmount: 100, createdAt: '2026-10-14', items: [], customerInfo: {
    fullName: 'Test', email: 'test@example.com', address: 'Address', city: 'City', state: 'State', phone: '08000000000',
    isGift: true, giftMessage: 'Happy birthday!'
  } };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('failed history shows an error, then Retry can show a genuinely empty history', async () => {
  ordersAPI.getMyOrders.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce([]);
  render(<ProfilePage user={user} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load');
  expect(screen.queryByText('No orders yet')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('No orders yet')).toBeInTheDocument();
});

test('expired history credentials prompt sign-in instead of an empty history', async () => {
  ordersAPI.getMyOrders.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
  const navigate = jest.fn();
  render(<ProfilePage user={user} setCurrentPage={navigate} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
  expect(navigate).toHaveBeenCalledWith('auth');
  expect(screen.queryByText('No orders yet')).not.toBeInTheDocument();
});

test('customer history displays saved shipment tracking', async () => {
  ordersAPI.getMyOrders.mockResolvedValueOnce([{ ...order, status: 'shipped', trackingNumber: 'TRACK-123' }]);
  render(<ProfilePage user={user} />);
  expect(await screen.findByText('TRACK-123')).toBeInTheDocument();
});

test('admin sees gift instructions and sends the tracking number with shipped status', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [order] });
  ordersAPI.updateOrderStatus.mockResolvedValueOnce({ data: { ...order, status: 'shipped', trackingNumber: 'TRACK-123' } });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View order ANJ-123' }));
  expect(screen.getByText('Gift wrapping requested')).toBeInTheDocument();
  expect(screen.getByText('Happy birthday!')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Tracking number/), { target: { value: 'TRACK-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Mark as shipped' }));
  await waitFor(() => expect(ordersAPI.updateOrderStatus).toHaveBeenCalledWith('order1', { status: 'shipped', trackingNumber: 'TRACK-123' }, 'token'));
  expect(await screen.findByRole('button', { name: 'Save tracking number' })).toBeInTheDocument();
});

test('admin fetch errors offer Retry rather than reporting no orders', async () => {
  ordersAPI.getAllOrders.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: [] });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load orders');
  expect(screen.queryByText('No orders found')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('No orders found')).toBeInTheDocument();
});

test('admin can open purchased items, see pack quantities and historical prices, then close with keyboard', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, items: [
    { name: 'Cosmetic bag', product: { name: 'Renamed bag', price: 9000 }, quantity: 2, price: 1500, selectedSize: 'Large', selectedColor: 'Pink' },
    { name: 'Foot care pack', product: null, quantity: 2, selectedPieces: 3, price: 3000, pricePerPiece: 1000 }
  ] }] });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  const toggle = await screen.findByRole('button', { name: 'View order ANJ-123' });
  expect(toggle).toHaveTextContent('View order');
  expect(toggle).toHaveAttribute('aria-haspopup', 'dialog');
  expect(screen.queryByText('Cosmetic bag')).not.toBeInTheDocument();
  act(() => userEvent.click(toggle));
  expect(screen.getByRole('dialog', { name: '#ANJ-123' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close order details' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  expect(screen.getByText('Cosmetic bag')).toBeInTheDocument();
  expect(screen.getByText('Unit price: ₦1,500')).toBeInTheDocument();
  expect(screen.queryByText(/9,000|Renamed bag/)).not.toBeInTheDocument();
  expect(screen.getByText('Pink')).toBeInTheDocument();
  expect(screen.getByText('Large')).toBeInTheDocument();
  expect(screen.getByText('Foot care pack')).toBeInTheDocument();
  expect(screen.getByText('Quantity: 2 packs of 3 pieces')).toBeInTheDocument();
  expect(screen.getByText('Total pieces: 6')).toBeInTheDocument();
  expect(screen.getByText('Pack price: ₦3,000')).toBeInTheDocument();
  expect(screen.getByText('₦6,000')).toBeInTheDocument();
  act(() => userEvent.keyboard('{Escape}'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(toggle).toHaveFocus();
  expect(document.body.style.overflow).not.toBe('hidden');
  expect(screen.queryByText('Cosmetic bag')).not.toBeInTheDocument();
  expect(ordersAPI.updateOrderStatus).not.toHaveBeenCalled();
});

test('incomplete legacy item records still open and do not substitute current product prices', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, items: [
    { product: { name: 'Tote bag', price: 8000 }, quantity: 1 },
    { name: 'Deleted product', product: null, quantity: 1, price: null },
    null
  ] }] });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View order ANJ-123' }));
  expect(screen.getByText('Tote bag')).toBeInTheDocument();
  expect(screen.getByText('Deleted product')).toBeInTheDocument();
  expect(screen.getByText('Product name not recorded')).toBeInTheDocument();
  expect(screen.getAllByText('Unit price: Not recorded')).toHaveLength(3);
  expect(screen.queryByText(/NaN|8,000/)).not.toBeInTheDocument();
});

test.each([undefined, null, []])('missing or empty item lists show an explanation (%p)', async items => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [{ ...order, items }] });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View order ANJ-123' }));
  expect(screen.getByText('No item details were recorded for this order.')).toBeInTheDocument();
});

test('opening a different order shows only that order’s purchased items', async () => {
  ordersAPI.getAllOrders.mockResolvedValueOnce({ data: [
    { ...order, items: [{ name: 'Gift box', quantity: 1, price: 4000 }] },
    { ...order, _id: 'order2', orderNumber: 'ANJ-456', items: [{ name: 'Drinkware', quantity: 1, price: 2000 }] }
  ] });
  render(<AdminOrdersPage user={{ ...user, role: 'admin' }} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View order ANJ-123' }));
  expect(screen.getByText('Gift box')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close order details' }));
  fireEvent.click(screen.getByRole('button', { name: 'View order ANJ-456' }));
  expect(screen.getByText('Drinkware')).toBeInTheDocument();
  expect(screen.queryByText('Gift box')).not.toBeInTheDocument();
});

test('checkout with expired credentials stops before payment and sends the customer to sign-in', async () => {
  ordersAPI.createOrder.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
  const navigate = jest.fn();
  render(<CheckoutPage user={user} cart={[{ _id: 'item', name: 'Tote', price: 100, quantity: 1 }]}
    getTotalPrice={() => 100} setCurrentPage={navigate} />);
  for (const [placeholder, value] of [['08012345678', '08000000000'], ['Enter your complete delivery address', 'Address'], ['City', 'Abeokuta'], ['State', 'Ogun']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'abeokuta' } });
  fireEvent.click(screen.getByRole('button', { name: /Pay ₦/ }));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('auth'));
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
});

test.each([[2000, '₦2,000'], [1500, '₦1,500'], [0, '₦0'], [undefined, 'Not recorded']])('customer history shows the saved gift fee (%p)', async (fee, expected) => {
  ordersAPI.getMyOrders.mockResolvedValueOnce([{ ...order, customerInfo: { ...order.customerInfo, giftPackagingFee: fee } }]);
  render(<ProfilePage user={user} />);
  expect(await screen.findByText(`Gift packaging: ${expected}`)).toBeInTheDocument();
});

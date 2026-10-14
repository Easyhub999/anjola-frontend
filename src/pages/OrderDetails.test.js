import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  fireEvent.change(screen.getByLabelText('Tracking number'), { target: { value: 'TRACK-123' } });
  fireEvent.click(screen.getByRole('button', { name: /^shipped$/i }));
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

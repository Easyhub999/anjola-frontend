import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { ordersAPI, paymentsAPI } from '../api';
jest.mock('../api', () => ({ ordersAPI: { createOrder: jest.fn() }, paymentsAPI: { initializePayment: jest.fn() } }));
const user = { name: 'Ada', email: 'ada@example.test', token: 'token' };
const cart = [{ _id: 'product1', name: 'Gift pack', price: 3000, quantity: 3, selectedPieces: 3 }];
const renderCheckout = () => render(<CheckoutPage user={user} cart={cart} getTotalPrice={() => 9000} setCurrentPage={jest.fn()} />);
const fillDelivery = () => {
  for (const [placeholder, value] of [['08012345678', '08000000000'], ['Enter your complete delivery address', '12 Example Street'], ['City', 'Ikeja'], ['State', 'Lagos']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
};
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('gift price is disclosed before opting in, added once and removed when deselected', () => {
  renderCheckout();
  const gift = screen.getByRole('checkbox', { name: 'This is a gift (+₦2,000)' });
  expect(gift).not.toBeChecked();
  expect(screen.getByText(/Extra gift packaging costs ₦2,000 per order/)).toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zone1' } });
  expect(screen.getByRole('button', { name: 'Pay ₦14,600' })).toBeEnabled();
  fireEvent.click(gift);
  expect(screen.getByRole('button', { name: 'Pay ₦16,600' })).toBeEnabled();
  expect(screen.getByText('Gift packaging').parentElement).toHaveTextContent('₦2,000');
  expect(screen.queryByText('Free')).not.toBeInTheDocument();
  fireEvent.click(gift);
  expect(screen.getByRole('button', { name: 'Pay ₦14,600' })).toBeEnabled();
  expect(screen.queryByText('Gift packaging')).not.toBeInTheDocument();
  fireEvent.click(gift);
  expect(screen.getByRole('button', { name: 'Pay ₦16,600' })).toBeEnabled();
});

test.each([true, false])('checkout submits the displayed total and selected gift details (gift: %s)', async isGift => {
  ordersAPI.createOrder.mockResolvedValueOnce({ _id: 'order1' });
  // End the mocked flow before any payment provider navigation.
  paymentsAPI.initializePayment.mockRejectedValueOnce(new Error('Test stops before payment navigation'));
  renderCheckout(); fillDelivery();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'abeokuta' } });
  const gift = screen.getByRole('checkbox', { name: /This is a gift/ });
  fireEvent.click(gift);
  fireEvent.change(screen.getByLabelText('Gift message (optional)'), { target: { value: 'Happy birthday!' } });
  if (!isGift) fireEvent.click(gift);
  const total = isGift ? 11000 : 9000;
  fireEvent.click(screen.getByRole('button', { name: `Pay ₦${total.toLocaleString('en-NG')}` }));
  await waitFor(() => expect(ordersAPI.createOrder).toHaveBeenCalledWith(expect.objectContaining({
    totalAmount: total,
    customerInfo: expect.objectContaining({ isGift, giftMessage: isGift ? 'Happy birthday!' : '', shippingCost: 0 })
  }), 'token'));
  await waitFor(() => expect(paymentsAPI.initializePayment).toHaveBeenCalledWith({ orderId: 'order1' }));
  await waitFor(() => expect(window.alert).toHaveBeenCalled());
});

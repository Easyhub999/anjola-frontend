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
  fireEvent.click(screen.getByRole('radio', { name: /Doorstep delivery · Zone 1/ }));
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
  fireEvent.click(screen.getByRole('radio', { name: /Within Abeokuta/ }));
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
  expect(await screen.findByRole('alert')).toHaveTextContent('Test stops before payment navigation');
  expect(window.alert).not.toHaveBeenCalled();
});

test('invalid checkout focuses the first missing field and never calls payment APIs', () => {
  renderCheckout();
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));
  expect(screen.getByLabelText(/Phone number/)).toHaveFocus();
  expect(screen.getByText('Enter your phone number.')).toBeInTheDocument();
  expect(screen.getByText('Choose a delivery method for your location.')).toBeInTheDocument();
  expect(ordersAPI.createOrder).not.toHaveBeenCalled();
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
  expect(window.alert).not.toHaveBeenCalled();
});

test('email validation is inline and a corrected value clears its error', () => {
  renderCheckout(); fillDelivery();
  fireEvent.click(screen.getByRole('radio', { name: /Within Abeokuta/ }));
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'not-an-email' } });
  fireEvent.click(screen.getByRole('button', { name: 'Pay ₦9,000' }));
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  expect(screen.getByLabelText(/Email address/)).toHaveFocus();
  expect(screen.getByLabelText(/Email address/)).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'new@example.test' } });
  expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
  expect(ordersAPI.createOrder).not.toHaveBeenCalled();
});

test.each([
  ['Within Abeokuta', 9000], ['Park delivery', 9000],
  ['Doorstep delivery · Zone 1', 14600], ['Doorstep delivery · Zone 2', 16000], ['Doorstep delivery · Zone 3', 17500]
])('delivery option %s preserves the existing checkout rate', (title, total) => {
  renderCheckout();
  fireEvent.click(screen.getByRole('radio', { name: new RegExp(title) }));
  expect(screen.getByRole('button', { name: `Pay ₦${total.toLocaleString('en-NG')}` })).toBeEnabled();
  if (title === 'Park delivery') {
    expect(screen.getByText(/Your driver’s transport fare is separate/)).toBeInTheDocument();
    expect(screen.getByText('Shipping').parentElement).toHaveTextContent('Paid to driver');
  }
});

test('order summary shows pack count, total pieces and line price', () => {
  renderCheckout();
  expect(screen.getByText('3 packs × 3 pieces')).toBeInTheDocument();
  expect(screen.getByText('9 pieces in total')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Gift pack' }).parentElement).toHaveTextContent('₦9,000');
});

test('policy links preserve delivery and gift details before starting payment', async () => {
  ordersAPI.createOrder.mockResolvedValueOnce({ _id: 'order1' });
  paymentsAPI.initializePayment.mockRejectedValueOnce(new Error('Test stops before payment navigation'));
  const navigate = jest.fn();
  render(<CheckoutPage user={user} cart={cart} getTotalPrice={() => 9000} setCurrentPage={navigate} />);
  fillDelivery();
  fireEvent.click(screen.getByRole('radio', { name: /Park delivery/ }));
  fireEvent.click(screen.getByRole('checkbox', { name: /This is a gift/ }));
  fireEvent.change(screen.getByLabelText('Gift message (optional)'), { target: { value: 'A little thank you' } });

  const notice = screen.getByText(/We do not offer voluntary returns, refunds or exchanges/);
  expect(notice).toHaveTextContent('Your statutory consumer rights remain protected.');
  const paymentButton = screen.getByRole('button', { name: 'Pay ₦11,000' });
  expect(notice.compareDocumentPosition(paymentButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  for (const [label, path] of [['Shipping policy', '/shipping-policy'], ['Returns policy', '/returns-policy']]) {
    const link = screen.getByRole('link', { name: `${label} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', path);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
  }
  expect(navigate).not.toHaveBeenCalled();
  expect(ordersAPI.createOrder).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/Phone number/)).toHaveValue('08000000000');
  expect(screen.getByPlaceholderText('Enter your complete delivery address')).toHaveValue('12 Example Street');
  expect(screen.getByRole('radio', { name: /Park delivery/ })).toBeChecked();
  expect(screen.getByLabelText('Gift message (optional)')).toHaveValue('A little thank you');

  fireEvent.click(paymentButton);
  await waitFor(() => expect(ordersAPI.createOrder).toHaveBeenCalledWith(expect.objectContaining({
    totalAmount: 11000,
    customerInfo: expect.objectContaining({ shippingMethodId: 'park', shippingCost: 0, isGift: true, giftMessage: 'A little thank you' })
  }), 'token'));
  await waitFor(() => expect(paymentsAPI.initializePayment).toHaveBeenCalledWith({ orderId: 'order1' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Test stops before payment navigation');
});

test('retrying a failed payment opening reuses the order; changed gift details create a new snapshot', async () => {
  ordersAPI.createOrder.mockResolvedValueOnce({ _id: 'order1' }).mockResolvedValueOnce({ _id: 'order2' });
  paymentsAPI.initializePayment.mockRejectedValue(new Error('Payment service temporarily unavailable'));
  renderCheckout(); fillDelivery();
  fireEvent.click(screen.getByRole('radio', { name: /Within Abeokuta/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Pay ₦9,000' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Payment service temporarily unavailable');
  expect(screen.getByRole('alert')).toHaveFocus();
  expect(screen.getByPlaceholderText('City')).toHaveValue('Ikeja');
  fireEvent.click(screen.getByRole('button', { name: 'Pay ₦9,000' }));
  await waitFor(() => expect(paymentsAPI.initializePayment).toHaveBeenCalledTimes(2));
  await screen.findByRole('alert');
  expect(ordersAPI.createOrder).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('checkbox', { name: /This is a gift/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Pay ₦11,000' }));
  await waitFor(() => expect(paymentsAPI.initializePayment).toHaveBeenLastCalledWith({ orderId: 'order2' }));
  await screen.findByRole('alert');
  expect(ordersAPI.createOrder).toHaveBeenCalledTimes(2);
  expect(ordersAPI.createOrder.mock.calls[1][0].totalAmount).toBe(11000);
});

test('rapid submissions send one request and lock editable details while awaiting payment', async () => {
  let rejectPayment;
  ordersAPI.createOrder.mockResolvedValueOnce({ _id: 'order1' });
  paymentsAPI.initializePayment.mockImplementationOnce(() => new Promise((resolve, reject) => { rejectPayment = reject; }));
  renderCheckout(); fillDelivery();
  fireEvent.click(screen.getByRole('radio', { name: /Within Abeokuta/ }));
  const pay = screen.getByRole('button', { name: 'Pay ₦9,000' });
  fireEvent.click(pay); fireEvent.click(pay);
  await waitFor(() => expect(paymentsAPI.initializePayment).toHaveBeenCalledTimes(1));
  expect(ordersAPI.createOrder).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText(/Full name/)).toBeDisabled();
  expect(screen.getByRole('radio', { name: /Within Abeokuta/ })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: /This is a gift/ })).toBeDisabled();
  rejectPayment(new Error('Try again'));
  await screen.findByRole('alert');
  expect(screen.getByLabelText(/Full name/)).toBeEnabled();
});

test('empty checkout offers shopping and cannot create an order', () => {
  const navigate = jest.fn();
  render(<CheckoutPage cart={[]} getTotalPrice={() => 0} setCurrentPage={navigate} />);
  expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Pay ₦/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Explore the collection' }));
  expect(navigate).toHaveBeenCalledWith('shop');
  expect(ordersAPI.createOrder).not.toHaveBeenCalled();
});

test('a late account load prefills untouched contact details without replacing typed input', () => {
  const props = { cart, getTotalPrice: () => 9000, setCurrentPage: jest.fn() };
  const { rerender } = render(<CheckoutPage {...props} />);
  fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'Recipient name' } });
  rerender(<CheckoutPage {...props} user={user} />);
  expect(screen.getByLabelText(/Full name/)).toHaveValue('Recipient name');
  expect(screen.getByLabelText(/Email address/)).toHaveValue('ada@example.test');
});

test('stale pricing errors stay visible and never start payment', async () => {
  ordersAPI.createOrder.mockRejectedValueOnce(Object.assign(new Error('Prices have changed. Refresh the shop.'), { status: 409 }));
  const navigate = jest.fn();
  render(<CheckoutPage user={user} cart={cart} getTotalPrice={() => 9000} setCurrentPage={navigate} />);
  fillDelivery(); fireEvent.click(screen.getByRole('radio', { name: /Within Abeokuta/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Pay ₦9,000' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Prices have changed');
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Review your items' }));
  expect(navigate).toHaveBeenCalledWith('shop');
});

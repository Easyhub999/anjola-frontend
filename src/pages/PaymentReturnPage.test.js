import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PaymentReturnPage from './PaymentReturnPage';
import { paymentsAPI } from '../api';

jest.mock('../api', () => ({ paymentsAPI: { verifyPayment: jest.fn(), initializePayment: jest.fn() } }));

const reference = 'ANJ-123.456=abc';
const confirmed = (overrides = {}) => ({ success: true, data: { reference, amount: 1460000, currency: 'NGN', needsReview: false, ...overrides } });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

beforeEach(() => {
  jest.resetAllMocks();
  window.history.replaceState({}, '', `/payment-return?reference=${reference}&trxref=${reference}`);
});
afterEach(() => jest.useRealTimers());

test('verified payment shows the actual amount and keeps the reference while clearing the bag once', async () => {
  paymentsAPI.verifyPayment.mockResolvedValue(confirmed());
  const clearCart = jest.fn();
  const originalURL = window.location.href;
  const { rerender } = render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  expect(await screen.findByRole('heading', { name: 'Payment confirmed.' })).toBeInTheDocument();
  expect(screen.getByText('₦14,600.00')).toBeInTheDocument();
  expect(screen.getByText(reference)).toBeInTheDocument();
  expect(screen.getByText('Your order is ready for our team')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Continue shopping/ })).toHaveAttribute('href', '/shop');
  expect(paymentsAPI.verifyPayment).toHaveBeenCalledWith(reference, { signal: expect.any(AbortSignal) });
  await waitFor(() => expect(clearCart).toHaveBeenCalledTimes(1));
  rerender(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  expect(clearCart).toHaveBeenCalledTimes(1);
  expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(1);
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
  expect(window.location.href).toBe(originalURL);
});

test('payment needing review confirms payment but makes no fulfilment or delivery promise', async () => {
  paymentsAPI.verifyPayment.mockResolvedValue(confirmed({ needsReview: true }));
  const clearCart = jest.fn();
  render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  expect(await screen.findByText('Your order needs a review')).toBeInTheDocument();
  expect(screen.getByText(/confirm availability or discuss refund options/)).toHaveTextContent('Do not pay again.');
  expect(screen.queryByText(/prepare it for fulfilment/)).not.toBeInTheDocument();
  expect(screen.queryByText(/3-7|email has been sent/i)).not.toBeInTheDocument();
  const supportURL = new URL(screen.getByRole('link', { name: /Contact us on WhatsApp/ }).href);
  expect(supportURL.hostname).toBe('wa.me');
  expect(supportURL.searchParams.get('text')).toContain(reference);
  expect(clearCart).toHaveBeenCalledTimes(1);
});

test('network error keeps the reference and a retry verifies the same payment without charging again', async () => {
  const retryResult = deferred();
  paymentsAPI.verifyPayment.mockRejectedValueOnce(new Error('Network unavailable')).mockReturnValueOnce(retryResult.promise);
  const clearCart = jest.fn();
  const originalURL = window.location.href;
  render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  const retry = await screen.findByRole('button', { name: /Retry verification/ });
  expect(screen.getByRole('heading', { name: 'We couldn’t confirm your payment yet.' })).toBeInTheDocument();
  expect(screen.getByText('Do not pay again if you have already been charged.')).toBeInTheDocument();
  expect(screen.getByText(reference)).toBeInTheDocument();
  expect(clearCart).not.toHaveBeenCalled();
  fireEvent.click(retry);
  fireEvent.click(retry);
  await waitFor(() => expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('heading', { name: 'Checking your payment…' })).toBeInTheDocument();
  await act(async () => retryResult.resolve(confirmed()));
  expect(screen.getByRole('heading', { name: 'Payment confirmed.' })).toBeInTheDocument();
  expect(clearCart).toHaveBeenCalledTimes(1);
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
  expect(window.location.href).toBe(originalURL);
});

test.each([
  ['pending payment', { success: false, data: confirmed().data }],
  ['string success', { success: 'true', data: confirmed().data }],
  ['missing data', { success: true }],
  ['wrong reference', confirmed({ reference: 'different-payment' })],
  ['wrong currency', confirmed({ currency: 'USD' })],
  ['string amount', confirmed({ amount: '1460000' })],
  ['zero amount', confirmed({ amount: 0 })],
  ['negative amount', confirmed({ amount: -100 })],
  ['fractional kobo amount', confirmed({ amount: 100.5 })],
  ['missing review status', confirmed({ needsReview: undefined })],
  ['empty response', null]
])('%s never shows a paid confirmation or clears the bag', async (label, response) => {
  paymentsAPI.verifyPayment.mockResolvedValue(response);
  const clearCart = jest.fn();
  render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  expect(await screen.findByRole('button', { name: /Retry verification/ })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Payment confirmed.' })).not.toBeInTheDocument();
  expect(screen.queryByText('Amount paid')).not.toBeInTheDocument();
  expect(clearCart).not.toHaveBeenCalled();
});

test.each([null, '', 'bad/reference', 'bad reference', 'a'.repeat(201)])('invalid reference %s never calls the API and offers recovery support', async value => {
  const clearCart = jest.fn();
  render(<PaymentReturnPage reference={value} clearCart={clearCart} />);
  expect(await screen.findByRole('heading', { name: 'Let’s find your payment.' })).toBeInTheDocument();
  expect(screen.getByText('Do not pay again if you have already been charged.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Email our team' })).toHaveAttribute('href', expect.stringContaining('mailto:anjolaaestheticsng@gmail.com'));
  expect(paymentsAPI.verifyPayment).not.toHaveBeenCalled();
  expect(paymentsAPI.initializePayment).not.toHaveBeenCalled();
  expect(clearCart).not.toHaveBeenCalled();
});

test('Strict Mode replays share one verification request and clear the bag once', async () => {
  const request = deferred();
  paymentsAPI.verifyPayment.mockReturnValue(request.promise);
  const clearCart = jest.fn();
  render(<StrictMode><PaymentReturnPage reference={reference} clearCart={clearCart} /></StrictMode>);
  await waitFor(() => expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(1));
  await act(async () => request.resolve(confirmed()));
  expect(screen.getByRole('heading', { name: 'Payment confirmed.' })).toBeInTheDocument();
  expect(clearCart).toHaveBeenCalledTimes(1);
});

test('changing the reference ignores the previous payment response', async () => {
  const oldRequest = deferred();
  const newRequest = deferred();
  paymentsAPI.verifyPayment.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise);
  const clearCart = jest.fn();
  const { rerender } = render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  await waitFor(() => expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(1));
  rerender(<PaymentReturnPage reference="new-reference" clearCart={clearCart} />);
  await waitFor(() => expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(2));
  await act(async () => oldRequest.resolve(confirmed()));
  expect(screen.queryByRole('heading', { name: 'Payment confirmed.' })).not.toBeInTheDocument();
  expect(clearCart).not.toHaveBeenCalled();
  expect(screen.getByText('new-reference')).toBeInTheDocument();
  await act(async () => newRequest.resolve(confirmed({ reference: 'new-reference' })));
  expect(screen.getByRole('heading', { name: 'Payment confirmed.' })).toBeInTheDocument();
  expect(clearCart).toHaveBeenCalledTimes(1);
});

test('an unmounted page does not clear the bag when a late verification succeeds', async () => {
  const request = deferred();
  paymentsAPI.verifyPayment.mockReturnValue(request.promise);
  const clearCart = jest.fn();
  const { unmount } = render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  await waitFor(() => expect(paymentsAPI.verifyPayment).toHaveBeenCalledTimes(1));
  unmount();
  await act(async () => request.resolve(confirmed()));
  expect(clearCart).not.toHaveBeenCalled();
});

test('a request exceeding 20 seconds is aborted and offers a safe retry', async () => {
  jest.useFakeTimers();
  const request = deferred();
  paymentsAPI.verifyPayment.mockReturnValue(request.promise);
  const clearCart = jest.fn();
  render(<PaymentReturnPage reference={reference} clearCart={clearCart} />);
  await act(async () => {});
  const signal = paymentsAPI.verifyPayment.mock.calls[0][1].signal;
  expect(signal.aborted).toBe(false);
  await act(async () => jest.advanceTimersByTime(20000));
  expect(signal.aborted).toBe(true);
  expect(screen.getByRole('button', { name: /Retry verification/ })).toBeInTheDocument();
  expect(screen.getByText(reference)).toBeInTheDocument();
  expect(clearCart).not.toHaveBeenCalled();
  await act(async () => request.resolve(confirmed()));
  expect(screen.queryByRole('heading', { name: 'Payment confirmed.' })).not.toBeInTheDocument();
  expect(clearCart).not.toHaveBeenCalled();
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManualOrderModal from './ManualOrderModal';
import { ordersAPI } from '../api';
jest.mock('../api', () => ({ ordersAPI: { createManualOrder: jest.fn() } }));
test('manual order retains separate variants and sends pack quantities at pack prices', async () => {
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  ordersAPI.createManualOrder.mockResolvedValue({});
  const product = { _id: 'p1', name: 'Tote', price: 1000, sizes: ['M'], colors: [{ name: 'Pink', quantity: 20 }, { name: 'Black', quantity: 20 }], priceVariations: [{ pieces: 3, price: 2700 }, { pieces: 6, price: 5000 }] };
  render(<ManualOrderModal isOpen products={[product]} user={{ token: 'token' }} onClose={() => {}} />);
  for (let i = 0; i < 2; i++) {
    fireEvent.change(screen.getByPlaceholderText('Search products to add...'), { target: { value: 'Tote' } });
    fireEvent.click(screen.getByRole('button', { name: /Tote/ }));
  }
  screen.getAllByLabelText('Tote selectedSize').forEach(select => fireEvent.change(select, { target: { value: 'M' } }));
  fireEvent.change(screen.getAllByLabelText('Tote selectedColor')[0], { target: { value: 'Pink' } });
  fireEvent.change(screen.getAllByLabelText('Tote selectedColor')[1], { target: { value: 'Black' } });
  fireEvent.change(screen.getAllByLabelText('Tote selectedPieces')[1], { target: { value: '6' } });
  for (const [placeholder, value] of [['Full Name *', 'Test'], ['Email', 'test@example.com'], ['Phone Number *', '123'], ['City', 'Lagos'], ['State', 'Lagos'], ['Delivery Address *', 'Road']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Create Order' }));
  await waitFor(() => expect(screen.getByText('No items added yet')).toBeInTheDocument());
  const data = ordersAPI.createManualOrder.mock.calls[0][0];
  expect(data.items).toHaveLength(2);
  expect(data.items[0]).toMatchObject({ selectedColor: 'Pink', selectedSize: 'M', selectedPieces: 3, quantity: 1, price: 2700 });
  expect(data.items[1]).toMatchObject({ selectedColor: 'Black', selectedPieces: 6, quantity: 1, price: 5000 });
  expect(data.totalAmount).toBe(7700);
  alert.mockRestore();
});

test('manual gift orders add one packaging fee, submit the message and reset the option', async () => {
  ordersAPI.createManualOrder.mockClear();
  ordersAPI.createManualOrder.mockResolvedValueOnce({});
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  render(<ManualOrderModal isOpen products={[{ _id: 'p1', name: 'Tote', price: 6000 }]} user={{ token: 'token' }} onClose={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText('Search products to add...'), { target: { value: 'Tote' } });
  fireEvent.click(screen.getByRole('button', { name: /Tote/ }));
  for (const [placeholder, value] of [['Full Name *', 'Ada'], ['Email', 'ada@example.test'], ['Phone Number *', '123'], ['City', 'Lagos'], ['State', 'Lagos'], ['Delivery Address *', 'Example Street']]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  }
  fireEvent.click(screen.getByRole('checkbox', { name: /This is a gift/ }));
  expect(screen.getByText('Gift packaging:').parentElement).toHaveTextContent('₦2,000');
  fireEvent.change(screen.getByLabelText('Gift message (optional)'), { target: { value: 'Happy birthday!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create Order' }));
  await waitFor(() => expect(ordersAPI.createManualOrder).toHaveBeenCalledWith(expect.objectContaining({
    totalAmount: 8000, customerInfo: expect.objectContaining({ isGift: true, giftMessage: 'Happy birthday!' })
  }), 'token'));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: /This is a gift/ })).not.toBeChecked());
  alert.mockRestore();
});

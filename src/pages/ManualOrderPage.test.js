import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManualOrderPage from './ManualOrderPage';
import { ordersAPI } from '../api';
jest.mock('../api', () => ({ ordersAPI: { createManualOrder: jest.fn() } }));
const product = { _id: 'p1', name: 'Tote', price: 1000, quantity: 12, inStock: true, visible: true, colors: [{ name: 'Pink', quantity: 12 }], priceVariations: [{ pieces: 3, price: 2700 }] };
const admin = { role: 'admin', token: 'test-token' };
beforeEach(() => jest.resetAllMocks());
function fill() {
  for (const [label,value] of [['Full name','Ada'],['Phone number','08012345678'],['Delivery address','Example street'],['City','Lagos'],['State','Lagos']]) fireEvent.change(screen.getByLabelText(label),{ target:{ value } });
  fireEvent.change(screen.getByLabelText('Find a product'),{ target:{ value:'Tote' } });
  fireEvent.click(screen.getByRole('button',{ name:/Tote/ }));
  fireEvent.change(screen.getByLabelText('Color'),{ target:{ value:'Pink' } });
}
test('WhatsApp order can be saved without email, using pack prices and source', async () => {
  ordersAPI.createManualOrder.mockResolvedValue({ orderNumber: 'MAN-1' });
  render(<ManualOrderPage user={admin} products={[product]} />); fill();
  fireEvent.click(screen.getByRole('button',{ name:'Create order' }));
  await screen.findByText('Ready for the next step.');
  expect(ordersAPI.createManualOrder).toHaveBeenCalledWith(expect.objectContaining({ orderSource:'whatsapp', paymentStatus:'pending', totalAmount:2700, sendCustomerEmail:false, customerInfo:expect.objectContaining({ email:'' }), items:[expect.objectContaining({ selectedColor:'Pink',selectedPieces:3,quantity:1 })] }), 'test-token');
});
test('failed save retains customer and product selections and shows inline feedback', async () => {
  ordersAPI.createManualOrder.mockRejectedValue(new Error('Insufficient stock'));
  render(<ManualOrderPage user={admin} products={[product]} />); fill();
  fireEvent.click(screen.getByRole('button',{ name:'Create order' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Insufficient stock');
  expect(screen.getByLabelText('Full name')).toHaveValue('Ada');
  expect(screen.getByLabelText('Color')).toHaveValue('Pink');
});
test('paid gift order records payment details and email choice', async () => {
  ordersAPI.createManualOrder.mockResolvedValue({ orderNumber: 'MAN-2' });
  render(<ManualOrderPage user={admin} products={[product]} />); fill();
  fireEvent.change(screen.getByLabelText('Email (optional)'),{ target:{ value:'ada@example.com' } });
  fireEvent.click(screen.getByLabelText('Email confirmation to the customer'));
  fireEvent.click(screen.getByLabelText(/Gift packaging/));
  fireEvent.change(screen.getByLabelText('Payment status'),{ target:{ value:'paid' } });
  fireEvent.change(screen.getByLabelText('Payment reference (optional)'),{ target:{ value:'bank-123' } });
  fireEvent.click(screen.getByRole('button',{ name:'Create order' }));
  await screen.findByText('Ready for the next step.');
  await waitFor(() => expect(ordersAPI.createManualOrder).toHaveBeenCalledWith(expect.objectContaining({ totalAmount:4700, paymentStatus:'paid', paymentMethod:'bank_transfer', paymentReference:'bank-123', sendCustomerEmail:true }), 'test-token'));
});


test('category dropdown lists saved categories and shows products without a search term', () => {
  const catalog = [
    { ...product, category: 'Bags' },
    { ...product, _id: 'p2', name: 'Small tote', category: ' Bags ' },
    { ...product, _id: 'p3', name: 'Mug', category: 'Drinkware' },
    { ...product, _id: 'p4', name: 'Hidden item', category: 'Hidden', visible: false }
  ];
  render(<ManualOrderPage user={admin} products={catalog} />);
  const categories = screen.getByRole('combobox', { name: 'Category' });
  expect(Array.from(categories.options).map(option => option.text)).toEqual(['All categories', 'Bags', 'Drinkware']);
  fireEvent.change(categories, { target: { value: 'Bags' } });
  expect(screen.getByRole('button', { name: /^Tote/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Small tote/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^Mug/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^Tote/ }));
  expect(screen.getByLabelText('Color')).toBeInTheDocument();
  expect(categories).toHaveValue('Bags');
});

test('category selection combines with name search and can be cleared', () => {
  render(<ManualOrderPage user={admin} products={[{ ...product, category: 'Bags' }, { ...product, _id: 'p2', name: 'Mug', category: 'Drinkware', quantity: 0 }]} />);
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Bags' } });
  fireEvent.change(screen.getByLabelText('Find a product'), { target: { value: 'Mug' } });
  expect(screen.getByRole('status')).toHaveTextContent('No products match');
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: '' } });
  expect(screen.getByRole('button', { name: /^Mug/ })).toBeDisabled();
});

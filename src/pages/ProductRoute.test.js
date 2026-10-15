import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProductRoute from './ProductRoute';
import { productsAPI } from '../api';
jest.mock('../api', () => ({ productsAPI: { getProduct: jest.fn() } }));
jest.mock('./ProductDetailPage', () => function Product({ selectedProduct }) { return <h1>{selectedProduct.name}</h1>; });
const one = '507f1f77bcf86cd799439011'; const two = '507f1f77bcf86cd799439012';
const item = { _id: one, name: 'Rose tumbler', description: 'A favourite cup.', price: 5000, quantity: 2 };
beforeEach(() => { jest.clearAllMocks(); localStorage.clear(); });
test('a fresh direct visit loads by URL ID without a saved product', async () => {
  productsAPI.getProduct.mockResolvedValue(item); const resolved = jest.fn();
  render(<ProductRoute productId={one} onResolved={resolved} />);
  expect(await screen.findByRole('heading', { name: 'Rose tumbler' })).toBeInTheDocument();
  expect(productsAPI.getProduct).toHaveBeenCalledWith(one, expect.objectContaining({ signal: expect.anything() }));
  expect(resolved).toHaveBeenCalledWith(item);
  expect(document.title).toContain('Rose tumbler');
});
test('late requests cannot replace the item from a newer URL', async () => {
  let first; productsAPI.getProduct.mockImplementation(id => id === one ? new Promise(resolve => { first = resolve; }) : Promise.resolve({ ...item, _id: two, name: 'Tote bag' }));
  const { rerender } = render(<ProductRoute productId={one} />);
  rerender(<ProductRoute productId={two} />);
  expect(await screen.findByRole('heading', { name: 'Tote bag' })).toBeInTheDocument();
  first(item);
  await waitFor(() => expect(document.title).toContain('Tote bag'));
  expect(screen.queryByText('Rose tumbler')).toBeNull();
});
test('invalid IDs show a useful unavailable state without calling the API', () => {
  render(<ProductRoute productId="invalid" />);
  expect(screen.getByRole('heading')).toHaveTextContent('currently unavailable');
  expect(productsAPI.getProduct).not.toHaveBeenCalled();
  expect(screen.getByRole('link', { name: 'Explore the collection' })).toHaveAttribute('href','/shop');
});
test.each([null, { ...item, visible: false }, { ...item, _id: two }])('missing, hidden or mismatched API records cannot render a stale product', async value => {
  productsAPI.getProduct.mockResolvedValue(value);
  render(<ProductRoute productId={one} />);
  expect(await screen.findByRole('heading', { name: 'This item is currently unavailable.' })).toBeInTheDocument();
  expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow');
});
test('transient errors offer retry, while sold-out products still have a detail page', async () => {
  productsAPI.getProduct.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ ...item, quantity: 0, inStock: false });
  render(<ProductRoute productId={one} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Rose tumbler' })).toBeInTheDocument();
  expect(productsAPI.getProduct).toHaveBeenCalledTimes(2);
});

test('uppercase ObjectId URLs load the same product with a lowercase canonical', async () => {
  productsAPI.getProduct.mockResolvedValue(item);
  render(<ProductRoute productId={one.toUpperCase()} />);
  expect(await screen.findByRole('heading', { name: 'Rose tumbler' })).toBeInTheDocument();
  expect(document.querySelector('link[rel="canonical"]').href).toBe(`https://anjolaaestheticsng.com/product/${one}`);
});

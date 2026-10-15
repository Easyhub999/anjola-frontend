import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ShopPage from './ShopPage';
import { productPresentation } from '../productPresentation';
import { paymentsAPI } from '../api';
jest.mock('../api', () => ({ paymentsAPI: { verifyPayment: jest.fn() } }));
const products = [
  { _id: 'pack', name: 'Gift pack', category: 'gifts', price: 1000, salesPrice: 500, quantity: 6, priceVariations: [{ pieces: 3, price: 2700 }], image: '/gift.jpg', description: 'A gift.' },
  { _id: 'sale', name: 'Rose tumbler', category: 'drinkware', price: 5000, salesPrice: 2000, quantity: 2, image: '/tumbler.jpg' },
  { _id: 'bag', name: 'Tote bag', category: 'bags', price: 2500, quantity: 3, image: '/bag.jpg' },
];
const clearCart = jest.fn();
function Shop(props) {
  const [query, setQuery] = useState('');
  return <ShopPage products={products} cart={[]} searchQuery={query} setSearchQuery={setQuery} setCurrentPage={jest.fn()} setSelectedProduct={jest.fn()} addToCart={jest.fn()} removeFromCart={jest.fn()} clearCart={clearCart} {...props} />;
}
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/shop'); window.scrollTo = jest.fn(); jest.clearAllMocks(); });

test('price sorting follows displayed sale and pack prices', () => {
  render(<Shop />);
  fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-asc' } });
  expect(screen.getAllByRole('article').map(item => item.getAttribute('aria-label'))).toEqual(['Rose tumbler', 'Tote bag', 'Gift pack']);
  expect(within(screen.getByRole('article', { name: 'Gift pack' })).getByText(/₦2,700/)).toHaveTextContent('From ₦2,700');
  fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-desc' } });
  expect(screen.getAllByRole('article')[0]).toHaveAttribute('aria-label', 'Gift pack');
});

test('category and search combine and reset together', () => {
  render(<Shop />);
  fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'drinkware' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  fireEvent.change(screen.getByLabelText('Search products'), { target: { value: 'bag' } });
  expect(screen.getByText('No products found')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.getByLabelText('Search products')).toHaveValue('');
});

test('card purchase actions preserve direct adds and option selection', () => {
  const addToCart = jest.fn(); const setSelectedProduct = jest.fn(); const setCurrentPage = jest.fn();
  render(<Shop addToCart={addToCart} setSelectedProduct={setSelectedProduct} setCurrentPage={setCurrentPage} toggleWishlist={jest.fn()} />);
  fireEvent.click(within(screen.getByRole('article', { name: 'Tote bag' })).getByRole('button', { name: 'Add to bag' }));
  expect(addToCart).toHaveBeenCalledWith(products[2]);
  fireEvent.click(within(screen.getByRole('article', { name: 'Gift pack' })).getByRole('button', { name: 'Choose options' }));
  expect(setSelectedProduct).toHaveBeenCalledWith(products[0]);
  expect(setCurrentPage).toHaveBeenCalledWith('product/pack');
  expect(screen.getByRole('button', { name: 'Save Tote bag to wishlist' })).toBeInTheDocument();
});

test('quick view shows the pack price, routes option selection, and restores focus on close', () => {
  const setSelectedProduct = jest.fn(); const setCurrentPage = jest.fn();
  render(<Shop setSelectedProduct={setSelectedProduct} setCurrentPage={setCurrentPage} />);
  const trigger = screen.getByRole('button', { name: 'Quick view Gift pack' });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Gift pack' });
  expect(dialog).toHaveTextContent('From ₦2,700');
  expect(within(dialog).getByRole('link', { name: 'View full details' })).toHaveAttribute('href', '/product/pack');
  expect(within(dialog).getByRole('button', { name: 'Close quick view' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document.activeElement, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
  fireEvent.click(trigger);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Choose options' }));
  expect(setSelectedProduct).toHaveBeenCalledWith(products[0]);
  expect(setCurrentPage).toHaveBeenCalledWith('product/pack');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('pack availability requires enough pieces of one color and respects inStock', () => {
  expect(productPresentation({ ...products[0], quantity: 2 }).available).toBe(false);
  expect(productPresentation({ ...products[0], colors: [{ name: 'Pink', quantity: 2 }, { name: 'White', quantity: 2 }] }).available).toBe(false);
  expect(productPresentation({ ...products[0], colors: [{ name: 'Pink', quantity: 3 }] }).available).toBe(true);
  expect(productPresentation({ ...products[1], inStock: false }).available).toBe(false);
});

test('verified payment return still clears the cart and opens the confirmation', async () => {
  window.history.replaceState({}, '', '/shop?reference=test-payment');
  paymentsAPI.verifyPayment.mockResolvedValue({ success: true, data: { reference: 'test-payment', amount: 2000, currency: 'NGN' } });
  render(<Shop />);
  expect(await screen.findByText('Payment Successful!')).toBeInTheDocument();
  expect(paymentsAPI.verifyPayment).toHaveBeenCalledWith('test-payment');
  expect(clearCart).toHaveBeenCalledTimes(1);
});

test('product cards and recently viewed items expose permanent links without intercepting new-tab clicks', () => {
  const setSelectedProduct = jest.fn(); const setCurrentPage = jest.fn();
  render(<Shop setSelectedProduct={setSelectedProduct} setCurrentPage={setCurrentPage} recentlyViewed={[products[1]]} />);
  const imageLink = screen.getByRole('link', { name: 'View Rose tumbler' });
  expect(imageLink).toHaveAttribute('href', '/product/sale');
  expect(screen.getByRole('link', { name: 'Rose tumbler' })).toHaveAttribute('href', '/product/sale');
  expect(screen.getByRole('link', { name: /Rose tumbler Rose tumbler/ })).toHaveAttribute('href', '/product/sale');
  // Prevent JSDOM navigation only after React handles the event.
  const preventNavigation = event => event.preventDefault();
  document.addEventListener('click', preventNavigation);
  fireEvent.click(imageLink, { ctrlKey: true });
  fireEvent.click(imageLink, { metaKey: true });
  document.removeEventListener('click', preventNavigation);
  expect(setSelectedProduct).not.toHaveBeenCalled();
  expect(setCurrentPage).not.toHaveBeenCalled();
  fireEvent.click(imageLink);
  expect(setSelectedProduct).toHaveBeenCalledWith(products[1]);
  expect(setCurrentPage).toHaveBeenCalledWith('product/sale');
});

test('quick-view details navigate to the individual product and close the dialog', () => {
  const setCurrentPage = jest.fn();
  render(<Shop setCurrentPage={setCurrentPage} />);
  fireEvent.click(screen.getByRole('button', { name: 'Quick view Tote bag' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'View full details' }));
  expect(setCurrentPage).toHaveBeenCalledWith('product/bag');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  localStorage.clear();
});
const products = [
  { _id: 'hidden', name: 'Hidden gift', category: 'gifts', visible: false, quantity: 5, image: '/hidden.jpg' },
  { _id: 'sold', name: 'Sold gift', category: 'gifts', quantity: 0, image: '/sold.jpg' },
  { _id: 'gift', name: 'Care gift box', category: 'gifts', quantity: 5, price: 12000, image: '/gift.jpg' },
  { _id: 'cup', name: 'Rose tumbler', category: 'drinkware', quantity: 3, image: '/cup.jpg' },
  { _id: 'bag', name: 'Cosmetic bag', category: 'bags', quantity: 2, image: '/bag.jpg' },
];
test('hero and story feature available catalog items and open their actual details', () => {
  const setSelectedProduct = jest.fn(); const setCurrentPage = jest.fn();
  const { container } = render(<HomePage products={products} cart={[]} setSelectedProduct={setSelectedProduct} setCurrentPage={setCurrentPage} />);
  expect(screen.getByRole('link', { name: 'Explore Care gift box' })).toHaveAttribute('href', '/product/gift');
  fireEvent.click(screen.getByRole('link', { name: 'Explore Care gift box' }));
  expect(setSelectedProduct).toHaveBeenLastCalledWith(products[2]);
  expect(setCurrentPage).toHaveBeenLastCalledWith('product/gift');
  fireEvent.click(screen.getByRole('link', { name: 'Discover Cosmetic bag' }));
  expect(setSelectedProduct).toHaveBeenLastCalledWith(products[4]);
  expect(container.querySelector('img[src="/hero-ribbon.jpg"]')).toBeNull();
  expect(screen.queryByRole('link', { name: 'Explore Hidden gift' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Explore Sold gift' })).not.toBeInTheDocument();
});
test('empty catalog keeps shopping available without advertising a nonexistent gift', () => {
  const setCurrentPage = jest.fn();
  render(<HomePage products={[]} cart={[]} setCurrentPage={setCurrentPage} />);
  expect(screen.queryByRole('link', { name: /Discover a gift/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Explore the collection/ }));
  expect(setCurrentPage).toHaveBeenCalledWith('shop');
});

test('category browsing resets old search and pagination before opening the shop', () => {
  localStorage.setItem('shopSearch', 'unrelated');
  localStorage.setItem('shopPage', '7');
  localStorage.setItem('cameFromShop', 'true');
  const setCurrentPage = jest.fn();
  render(<HomePage products={products} cart={[]} setCurrentPage={setCurrentPage} />);
  fireEvent.click(screen.getByRole('button', { name: 'Shop drinkware' }));
  expect(localStorage.getItem('shopCategory')).toBe('drinkware');
  expect(localStorage.getItem('shopSearch')).toBe('');
  expect(localStorage.getItem('shopPage')).toBe('1');
  expect(localStorage.getItem('cameFromShop')).toBeNull();
  expect(setCurrentPage).toHaveBeenCalledWith('shop');
});

test('featured cards use pack prices, require options, and prevent sold-out purchases', () => {
  const addToCart = jest.fn(); const setSelectedProduct = jest.fn();
  const pack = { ...products[2], featured: true, price: 100, salesPrice: 50, priceVariations: [{ pieces: 3, price: 2400 }, { pieces: 6, price: 4500 }] };
  const simple = { ...products[3], featured: true, price: 2000 };
  const sold = { ...products[1], featured: true, price: 1500 };
  const { container } = render(<HomePage products={[pack, simple, sold]} cart={[]} addToCart={addToCart} setSelectedProduct={setSelectedProduct} setCurrentPage={jest.fn()} />);
  expect(container.querySelector('.anjola-card-price')).toHaveTextContent('From ₦2,400');
  fireEvent.click(screen.getByRole('button', { name: 'Choose options' }));
  expect(setSelectedProduct).toHaveBeenCalledWith(pack);
  expect(addToCart).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
  expect(addToCart).toHaveBeenCalledWith(simple);
  expect(screen.getByRole('button', { name: 'Currently unavailable' })).toBeDisabled();
});


test('gift spotlight uses the catalog price and opens product details', () => {
  const setSelectedProduct = jest.fn(); const setCurrentPage = jest.fn();
  render(<HomePage products={products} cart={[]} setSelectedProduct={setSelectedProduct} setCurrentPage={setCurrentPage} />);
  const spotlight = screen.getByRole('region', { name: /For the moments/ });
  expect(spotlight).toHaveTextContent('Care gift box');
  expect(spotlight).toHaveTextContent('₦12,000');
  fireEvent.click(screen.getByRole('link', { name: 'Take a closer look' }));
  expect(setSelectedProduct).toHaveBeenLastCalledWith(products[2]);
  expect(setCurrentPage).toHaveBeenLastCalledWith('product/gift');
  expect(screen.queryByText('Avg. Rating')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();
});

test('help actions work without a gift item and no gift spotlight is invented', () => {
  const setCurrentPage = jest.fn();
  render(<HomePage products={[products[3]]} cart={[]} setCurrentPage={setCurrentPage} />);
  expect(screen.queryByRole('region', { name: /For the moments/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Contact Anjola' }));
  expect(setCurrentPage).toHaveBeenCalledWith('contact');
  expect(screen.getByRole('link', { name: /Chat on WhatsApp/ })).toHaveAttribute('href', expect.stringContaining('https://wa.me/2347065943625'));
});


test.each(['reference', 'trxref'])('homepage forwards %s to verification without claiming payment success', param => {
  window.history.replaceState({}, '', `/?${param}=test%26reference`);
  const setCurrentPage = jest.fn();
  const { rerender } = render(<HomePage products={[]} cart={[]} setCurrentPage={setCurrentPage} />);
  expect(screen.queryByText('Payment Successful!')).not.toBeInTheDocument();
  expect(setCurrentPage).toHaveBeenCalledWith('shop?reference=test%26reference');
  rerender(<HomePage products={products} cart={[]} setCurrentPage={setCurrentPage} />);
  expect(setCurrentPage).toHaveBeenCalledTimes(1);
});

test('gift spotlight excludes products without enough color stock for any pack', () => {
  const unavailable = { ...products[2], featured: true, quantity: 6,
    priceVariations: [{ pieces: 3, price: 2400 }], colors: [{ name: 'Pink', quantity: 2 }, { name: 'White', quantity: 2 }] };
  render(<HomePage products={[unavailable]} cart={[]} setCurrentPage={jest.fn()} />);
  expect(screen.queryByRole('region', { name: /For the moments/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Explore Care gift box/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Currently unavailable' })).toBeDisabled();
});

import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import ProductDetailPage from './ProductDetailPage';
import { productsAPI } from '../api';
import { selectionPrice } from '../productSelection';
jest.mock('../api', () => ({ productsAPI: { addReview: jest.fn() } }));
const product = { _id: 'gift', name: 'Gift set', price: 1000, salesPrice: 700, quantity: 8, sizes: ['M'], colors: [{ name: 'Pink', quantity: 2 }, { name: 'White', quantity: 6 }], priceVariations: [{ pieces: 1, price: 900 }, { pieces: 3, price: 2400 }, { pieces: 9, price: 6000 }], images: ['/one.jpg', '/two.jpg'], description: 'A thoughtful gift.', reviews: [] };
const props = () => ({ selectedProduct: product, products: [], setCurrentPage: jest.fn(), setSelectedProduct: jest.fn(), addToCart: jest.fn() });
beforeEach(() => { window.scrollTo = jest.fn(); Element.prototype.scrollIntoView = jest.fn(); jest.clearAllMocks(); });

test('pack and color choices enforce piece stock and send exact selected pack price', () => {
  const p = props(); render(<ProductDetailPage {...p} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Choose options' })[0]);
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose your size, color, pack.');
  expect(p.addToCart).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /9 pieces/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /3 pieces ₦2,400/ }));
  expect(screen.getByRole('button', { name: /Pink/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'White' }));
  fireEvent.click(screen.getByRole('button', { name: 'M' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to bag' })[0]);
  expect(p.addToCart).toHaveBeenCalledWith(expect.objectContaining({ selectedSize: 'M', selectedColor: 'White', selectedPieces: 3, price: 2400, pricePerPiece: 800 }));
  expect(screen.getByText('Save ₦300 compared with individual packs')).toBeInTheDocument();
});

test('sale items use sale prices and pack savings require a genuine single-piece option', () => {
  const p = props(); p.selectedProduct = { ...product, sizes: [], colors: [], priceVariations: [] };
  render(<ProductDetailPage {...p} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to bag' })[0]);
  expect(p.addToCart).toHaveBeenCalledWith(expect.objectContaining({ price: 700, pricePerPiece: 700 }));
  expect(selectionPrice({ ...product, priceVariations: [{ pieces: 3, price: 2400 }] }, { pieces: 3, price: 2400 }).savings).toBe(0);
});

test('changing products resets gallery, options and feedback', () => {
  const p = props(); const { rerender } = render(<ProductDetailPage {...p} />);
  fireEvent.click(screen.getByRole('button', { name: 'Show view 2' }));
  fireEvent.click(screen.getByRole('button', { name: /3 pieces ₦2,400/ }));
  fireEvent.click(screen.getByRole('button', { name: 'White' }));
  fireEvent.click(screen.getByRole('button', { name: 'M' }));
  rerender(<ProductDetailPage {...p} selectedProduct={{ ...product, _id: 'other', name: 'Other gift', images: ['/other.jpg'] }} />);
  expect(screen.getByAltText('Other gift, view 1')).toHaveAttribute('src', '/other.jpg');
  expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(screen.getAllByRole('button', { name: 'Choose options' })[0]);
  expect(p.addToCart).not.toHaveBeenCalled();
});

test('enlarged gallery supports keyboard navigation, Escape and focus restoration', () => {
  render(<ProductDetailPage {...props()} />);
  const trigger = screen.getByRole('button', { name: 'Enlarge Gift set' }); trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Gift set gallery' });
  expect(within(dialog).getByRole('button', { name: 'Close gallery' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
  expect(within(dialog).getByAltText('Gift set, view 2')).toHaveAttribute('src', '/two.jpg');
  fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true });
  expect(within(dialog).getByRole('button', { name: 'Next enlarged photo' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe(''); expect(trigger).toHaveFocus();
});

test('unavailable product cannot be purchased and rejected adds show no success', () => {
  const p = props(); const { rerender } = render(<ProductDetailPage {...p} selectedProduct={{ ...product, inStock: false }} />);
  screen.getAllByRole('button', { name: 'Currently unavailable' }).forEach(button => expect(button).toBeDisabled());
  p.addToCart.mockReturnValue(false);
  rerender(<ProductDetailPage {...p} selectedProduct={{ ...product, sizes: [], colors: [], priceVariations: [] }} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to bag' })[0]);
  expect(screen.queryByText('Gift set added to your bag.')).not.toBeInTheDocument();
});

test('review submission updates displayed reviews without mutating the product prop', async () => {
  const p = props();
  productsAPI.addReview.mockResolvedValue({ reviews: [{ name: 'Ada', rating: 5, comment: 'Lovely', date: '2026-10-15' }] });
  render(<ProductDetailPage {...p} />);
  fireEvent.click(screen.getByRole('button', { name: 'Reviews (0)' }));
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText('Your review'), { target: { value: 'Lovely' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
  await waitFor(() => expect(screen.getByText('Thank you. Your review was submitted.')).toBeInTheDocument());
  expect(screen.getByText('Lovely')).toBeInTheDocument();
  expect(product.reviews).toEqual([]);
});

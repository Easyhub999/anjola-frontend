import { render, screen, fireEvent } from '@testing-library/react';
import CartSidebar from './CartSidebar';
import { cartLineKey } from '../cart';

test('sidebar controls target the selected variant, not every line of a product', () => {
  const cart = ['Pink', 'Blue'].map(selectedColor => ({
    _id: 'same-product', name: 'Tote', selectedColor, selectedSize: 'M', selectedPieces: 1, price: 800, quantity: 2
  }));
  const updateQuantity = jest.fn(); const removeFromCart = jest.fn();
  render(<CartSidebar showCart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
    setShowCart={jest.fn()} setCurrentPage={jest.fn()} getTotalPrice={() => 3200} />);
  fireEvent.click(screen.getAllByLabelText('Increase quantity')[1]);
  expect(updateQuantity).toHaveBeenLastCalledWith(cartLineKey(cart[1]), 1);
  fireEvent.click(screen.getAllByLabelText('Decrease quantity')[0]);
  expect(updateQuantity).toHaveBeenLastCalledWith(cartLineKey(cart[0]), -1);
  fireEvent.click(screen.getAllByLabelText('Remove item')[1]);
  expect(removeFromCart).toHaveBeenCalledWith(cartLineKey(cart[1]));
});

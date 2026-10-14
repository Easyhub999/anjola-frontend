import { addCartItem, cartLineKey, changeCartQuantity, removeCartItem, restoreCart } from './cart';

const item = { _id: 'product', price: 100, quantity: 1 };

test('different colors, sizes and packs remain independent', () => {
  const variants = [
    { ...item, selectedColor: 'Pink', selectedSize: 'S', selectedPieces: 1 },
    { ...item, selectedColor: 'Blue', selectedSize: 'S', selectedPieces: 1 },
    { ...item, selectedColor: 'Pink', selectedSize: 'M', selectedPieces: 1 },
    { ...item, selectedColor: 'Pink', selectedSize: 'S', selectedPieces: 3 }
  ];
  let cart = variants.reduce(addCartItem, []);
  expect(cart).toHaveLength(4);
  cart = changeCartQuantity(cart, cartLineKey(variants[1]), 1);
  expect(cart.map(line => line.quantity)).toEqual([1, 2, 1, 1]);
  cart = removeCartItem(cart, cartLineKey(variants[2]));
  expect(cart.map(cartLineKey)).toEqual([variants[0], variants[1], variants[3]].map(cartLineKey));
});

test('adding the same variant twice increments only that line', () => {
  const pink = { ...item, selectedColor: 'Pink' };
  const blue = { ...item, selectedColor: 'Blue' };
  const cart = [pink, blue, pink].reduce(addCartItem, []);
  expect(cart.map(line => line.quantity)).toEqual([2, 1]);
});

test('one-piece products have the same identity across old and new saved carts', () => {
  expect(cartLineKey(item)).toEqual(cartLineKey({ ...item, selectedPieces: 1 }));
  expect(cartLineKey(item)).toEqual(cartLineKey({ ...item, selectedPieces: null }));
});

test('saved cart normalization preserves variants and merges duplicate lines', () => {
  const restored = restoreCart([item, { ...item, selectedPieces: 1, quantity: 2 }, { ...item, selectedColor: 'Blue' }, null]);
  expect(restored.map(line => line.quantity)).toEqual([3, 1]);
  expect(restoreCart({})).toEqual([]);
});

test('unknown line keys never change another variant and quantity stays positive', () => {
  expect(removeCartItem([item], 'product')).toEqual([item]);
  expect(changeCartQuantity([item], cartLineKey(item), -1)[0].quantity).toBe(1);
});

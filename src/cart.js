// JSON tuples avoid collisions between option values containing separators.
export const cartLineKey = item => JSON.stringify([
  item._id, item.selectedSize || null, item.selectedColor || null, item.selectedPieces || 1
]);

export function addCartItem(cart, product) {
  const key = cartLineKey(product);
  const exists = cart.some(item => cartLineKey(item) === key);
  return exists
    ? cart.map(item => cartLineKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { ...product, quantity: 1 }];
}

export function changeCartQuantity(cart, key, change) {
  return cart.map(item => cartLineKey(item) === key
    ? { ...item, quantity: Math.max(1, item.quantity + change) } : item);
}

export const removeCartItem = (cart, key) => cart.filter(item => cartLineKey(item) !== key);

export function restoreCart(value) {
  if (!Array.isArray(value)) return [];
  const lines = new Map();
  for (const item of value) {
    if (!item || typeof item._id !== 'string' || !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
    const key = cartLineKey(item);
    const previous = lines.get(key);
    lines.set(key, previous ? { ...previous, quantity: previous.quantity + item.quantity } : item);
  }
  return [...lines.values()];
}

import { productPresentation } from './productPresentation';

export function canSelectPack(product, pieces, colorName = null) {
  if (!product || product.visible === false || product.inStock === false || !Number.isSafeInteger(pieces) || pieces < 1 || product.quantity < pieces) return false;
  const colors = product.colors || [];
  if (!colors.length) return !colorName;
  return colors.some(color => {
    const name = typeof color === 'string' ? color : color.name;
    return (!colorName || name === colorName) && (typeof color === 'string' || color.quantity >= pieces);
  });
}

export function selectionPrice(product, variation) {
  const { price: startingPrice, onSale, hasPacks } = productPresentation(product);
  const price = variation ? variation.price : startingPrice;
  const pieces = variation?.pieces || 1;
  // Only claim bundle savings when this product actually offers a single-piece pack.
  const singlePack = product.priceVariations?.find(pack => pack.pieces === 1);
  const savings = hasPacks ? (variation && singlePack ? Math.max(0, singlePack.price * pieces - price) : 0) : onSale ? product.price - price : 0;
  return { price, pieces, perPiece: price / pieces, savings, starting: hasPacks && !variation, onSale };
}

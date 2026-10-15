// Storefront display only. Checkout still validates prices and stock on the server.
export function productPresentation(product) {
  const packs = product.priceVariations || [];
  const hasPacks = packs.length > 0;
  const onSale = !hasPacks && product.salesPrice != null && product.salesPrice < product.price;
  const price = hasPacks ? Math.min(...packs.map(pack => pack.price)) : onSale ? product.salesPrice : product.price;
  const pieces = hasPacks ? Math.min(...packs.map(pack => pack.pieces)) : 1;
  const available = product.visible !== false && product.inStock !== false && product.quantity >= pieces &&
    (!product.colors?.length || product.colors.some(color => typeof color === 'string' || color.quantity >= pieces));
  return { price, hasPacks, onSale, available, hasOptions: Boolean(hasPacks || product.sizes?.length || product.colors?.length) };
}
export const formatPrice = amount => `₦${Number(amount).toLocaleString('en-NG')}`;

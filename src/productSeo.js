const brand = require('./branding.json');
const { productUrl } = require('./productLinks');

function plainText(value) { return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function safeImage(value) {
  try {
    const url = new URL(value, brand.url);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function productMetadata(product) {
  const name = plainText(product.name) || 'Product';
  const description = (plainText(product.description) || `Explore ${name} at ${brand.name}. Browse gifts and everyday essentials.`).slice(0, 160);
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean).map(safeImage).filter(Boolean);
  const canonical = productUrl(product);
  const packs = (product.priceVariations || []).filter(pack => Number.isFinite(pack.price) && pack.price >= 0 && Number.isFinite(pack.pieces) && pack.pieces > 0);
  const price = product.salesPrice != null && product.salesPrice < product.price ? product.salesPrice : product.price;
  const available = pieces => product.visible !== false && product.inStock !== false && product.quantity >= pieces &&
    (!product.colors?.length || product.colors.some(color => typeof color === 'string' || color.quantity >= pieces));
  const offer = (amount, pieces, label) => Object.assign({ '@type': 'Offer', price: amount, priceCurrency: 'NGN', url: canonical,
    availability: `https://schema.org/${available(pieces) ? 'InStock' : 'OutOfStock'}`,
    seller: { '@type': 'Organization', name: brand.name } }, label ? { name: label } : {});
  // Each pack is its own offer; never present a pack price as a per-piece price.
  const offers = packs.length ? packs.map(pack => offer(pack.price, pack.pieces, `${pack.pieces}-piece pack`)) :
    Number.isFinite(price) && price >= 0 ? offer(price, 1) : undefined;
  return {
    title: `${name} | ${brand.name}`, description, canonical, robots: 'index, follow',
    image: images[0] || brand.url + brand.image, imageAlt: images[0] ? name : brand.imageAlt,
    structuredData: Object.assign({ '@context': 'https://schema.org', '@type': 'Product', '@id': canonical + '#product', name,
      description: plainText(product.description) || description, url: canonical, sku: String(product._id),
      }, images.length ? { image: images } : {}, offers ? { offers } : {})
  };
}
module.exports = { productMetadata };

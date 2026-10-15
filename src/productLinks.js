const brand = require('./branding.json');
function productPath(productOrId) {
  const id = typeof productOrId === 'object' ? productOrId?._id : productOrId;
  const value = String(id || '');
  return `/product/${encodeURIComponent(/^[a-f\d]{24}$/i.test(value) ? value.toLowerCase() : value)}`;
}
function productUrl(productOrId) { return brand.url + productPath(productOrId); }
module.exports = { productPath, productUrl };

const fs = require('node:fs');
const path = require('node:path');
const brand = require('../src/branding.json');
const { productMetadata } = require('../src/productSeo');
const { productUrl } = require('../src/productLinks');

const CATALOG_URL = 'https://anjola-backend.onrender.com/api/products';
const PRODUCT_ID = /^[a-f\d]{24}$/i;
const CACHE = 'public, max-age=0, s-maxage=60, must-revalidate';

function escapeMarkup(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function renderProductHtml(template, metadata) {
  let html = template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i,
    () => `<title>${escapeMarkup(metadata.title)}</title>`);
  const values = {
    description: metadata.description, robots: metadata.robots,
    'og:title': metadata.title, 'og:description': metadata.description,
    'og:type': metadata.structuredData ? 'product' : 'website',
    'og:url': metadata.canonical, 'og:image': metadata.image, 'og:image:alt': metadata.imageAlt,
    'twitter:title': metadata.title, 'twitter:description': metadata.description,
    'twitter:image': metadata.image, 'twitter:image:alt': metadata.imageAlt
  };
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`<meta\\b[^>]*\\b(?:name|property)=["']${key}["'][^>]*>`, 'gi');
    const tag = `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escapeMarkup(value)}"/>`;
    html = pattern.test(html) ? html.replace(pattern, () => tag) : html.replace(/<\/head>/i, () => `${tag}</head>`);
  }
  // A product photo does not necessarily have the brand card's dimensions or MIME type.
  html = html.replace(/<meta\b[^>]*\bproperty=["']og:image:(?:width|height|type)["'][^>]*>/gi, '');
  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi,
    () => `<link rel="canonical" href="${escapeMarkup(metadata.canonical)}"/>`);
  html = html.replace(/<script\b[^>]*\bid=["']product-structured-data["'][^>]*>[\s\S]*?<\/script>/gi, '');
  if (metadata.structuredData) {
    const script = `<script id="product-structured-data" type="application/ld+json">${safeJson(metadata.structuredData)}</script>`;
    html = html.replace(/<\/head>/i, () => `${script}</head>`);
  }
  return html;
}

function unavailableMetadata(id, temporary) {
  return {
    title: `${temporary ? 'Product temporarily unavailable' : 'Product not found'} | ${brand.name}`,
    description: temporary ? 'We could not load this product right now. Please try again shortly.' :
      'This product is no longer available. Explore more gifts and everyday essentials in our shop.',
    canonical: PRODUCT_ID.test(id || '') ? productUrl(id.toLowerCase()) : `${brand.url}/shop`,
    robots: 'noindex, follow', image: brand.url + brand.image, imageAlt: brand.imageAlt
  };
}

function reply(req, res, status, body, contentType) {
  res.statusCode = status;
  res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', status === 200 ? CACHE : 'no-store');
  if (status !== 200) res.setHeader('X-Robots-Tag', 'noindex');
  if (status === 503) res.setHeader('Retry-After', '60');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(req.method === 'HEAD' ? undefined : body);
}

function acceptsRead(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  res.setHeader('Allow', 'GET, HEAD');
  reply(req, res, 405, 'Method not allowed.', 'text/plain');
  return false;
}

function requestedProductId(req) {
  try {
    const pathname = new URL(req.url, brand.url).pathname;
    const publicRoute = pathname.match(/^\/product\/([^/]+)\/?$/);
    // Rewrite query parameters can be overwritten by an incoming ?id=. The
    // public pathname must remain authoritative for both previews and the SPA.
    if (publicRoute) return decodeURIComponent(publicRoute[1]);
    if (pathname === '/api/product' || pathname === '/api/product/') {
      return typeof req.query?.id === 'string' ? req.query.id : '';
    }
  } catch {
    // Malformed URLs/encoding must not fall back to an unrelated query ID.
  }
  return '';
}

async function fetchCatalog(fetchImpl, suffix = '') {
  const response = await fetchImpl(CATALOG_URL + suffix, {
    headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000)
  });
  if (response.status === 404) return { notFound: true };
  if (!response.ok) throw Error('Catalog request failed');
  const payload = await response.json();
  if (!payload || payload.success === false) throw Error('Invalid catalog response');
  return { data: payload.data };
}

function createProductHandler({ fetchImpl = globalThis.fetch, readTemplate = () =>
  fs.readFileSync(path.join(__dirname, '../build/seo/product.html'), 'utf8') } = {}) {
  return async function productHandler(req, res) {
    if (!acceptsRead(req, res)) return;
    const id = requestedProductId(req);
    let status = 404;
    let metadata = unavailableMetadata(id, false);
    if (PRODUCT_ID.test(id)) {
      try {
        const result = await fetchCatalog(fetchImpl, `/${id.toLowerCase()}`);
        if (!result.notFound && result.data != null) {
          const product = result.data;
          if (typeof product._id !== 'string' || product._id.toLowerCase() !== id.toLowerCase()) {
            throw Error('Catalog returned a different product');
          }
          if (product.visible !== false) {
            metadata = productMetadata(product);
            status = 200;
          }
        }
      } catch {
        status = 503;
        metadata = unavailableMetadata(id, true);
      }
    }
    try {
      reply(req, res, status, renderProductHtml(readTemplate(), metadata), 'text/html');
    } catch {
      // Missing build output must not produce a successful, indexable blank page.
      reply(req, res, 503, '<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><title>Temporarily unavailable</title></head><body><p>Please try again shortly.</p></body></html>', 'text/html');
    }
  };
}

function createSitemapHandler({ fetchImpl = globalThis.fetch } = {}) {
  return async function sitemapHandler(req, res) {
    if (!acceptsRead(req, res)) return;
    try {
      const result = await fetchCatalog(fetchImpl);
      if (result.notFound || !Array.isArray(result.data)) throw Error('Invalid catalog response');
      const urls = new Set(Object.keys(brand.pages).map(route => brand.url + route));
      for (const product of result.data) {
        if (product && product.visible !== false && typeof product._id === 'string' && PRODUCT_ID.test(product._id)) {
          urls.add(productUrl(product._id.toLowerCase()));
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map(url => `  <url><loc>${escapeMarkup(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
      reply(req, res, 200, xml, 'application/xml');
    } catch {
      reply(req, res, 503, 'The sitemap is temporarily unavailable. Please try again shortly.', 'text/plain');
    }
  };
}

module.exports = { createProductHandler, createSitemapHandler, renderProductHtml };

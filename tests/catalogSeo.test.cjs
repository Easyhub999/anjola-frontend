const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createProductHandler, createSitemapHandler, renderProductHtml } = require('../lib/catalogSeo');
const { productMetadata } = require('../src/productSeo');
const brand = require('../src/branding.json');

const id = '507f1f77bcf86cd799439011';
const anotherId = '507f1f77bcf86cd799439012';
const product = {
  _id: id, name: 'Rose travel cup', description: 'An everyday favourite.',
  price: 12000, quantity: 3, inStock: true, visible: true,
  images: ['https://example.com/rose-cup.jpg']
};
// Exercise the actual source template and a representative generated React bundle tag.
const template = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8')
  .replace('</head>', '<script defer src="/static/js/main.example.js"></script></head>');
const request = (method = 'GET', requestedId = id) => ({ method, url: '/api/product', query: { id: requestedId } });
function response() {
  return {
    headers: {}, statusCode: null, body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(body) { this.body = body; }
  };
}
const upstream = data => async () => ({ ok: true, status: 200, json: async () => ({ success: true, data }) });
const preview = fetchImpl => createProductHandler({ fetchImpl, readTemplate: () => template });
const jsonLd = html => JSON.parse(html.match(/<script id="product-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('direct product responses contain matching metadata, prices, photo and the React assets', async () => {
  let calledUrl;
  let calledOptions;
  const handler = preview(async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return (await upstream(product)());
  });
  const res = response();
  await handler(request(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(calledUrl, `https://anjola-backend.onrender.com/api/products/${id}`);
  assert.ok(calledOptions.signal instanceof AbortSignal);
  assert.equal(calledOptions.headers.Accept, 'application/json');
  assert.match(res.body, /<title>Rose travel cup \| Anjola Aesthetics Ng<\/title>/);
  assert.ok(res.body.includes(`<link rel="canonical" href="${brand.url}/product/${id}"/>`));
  assert.match(res.body, /property="og:image" content="https:\/\/example.com\/rose-cup.jpg"/);
  assert.match(res.body, /name="twitter:image:alt" content="Rose travel cup"/);
  assert.match(res.body, /name="robots" content="index, follow"/);
  assert.doesNotMatch(res.body, /og:image:(width|height|type)/);
  assert.match(res.body, /src="\/static\/js\/main.example.js"/);
  assert.match(res.body, /<div id="root"><\/div>/);
  assert.equal(jsonLd(res.body).offers.price, 12000);
  assert.equal(jsonLd(res.body).offers.priceCurrency, 'NGN');
  assert.match(res.headers['cache-control'], /s-maxage=60/);
  assert.equal(res.headers['content-length'], Buffer.byteLength(res.body));
});

test('HTML metadata and JSON-LD resist quotes, tags and replacement-pattern injection', () => {
  const hostile = '</script><script>alert("oops")</script> & "double" \'single\' $&';
  const metadata = {
    title: hostile, description: hostile, canonical: `https://example.com/?q=${hostile}`,
    robots: 'index, follow', image: `https://example.com/image?q=${hostile}`,
    imageAlt: hostile, structuredData: { '@type': 'Product', name: hostile }
  };
  const html = renderProductHtml(template, metadata);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;\/script&gt;&lt;script&gt;alert\(&quot;oops&quot;\)/);
  assert.match(html, /&amp; &quot;double&quot; &#39;single&#39; \$&amp;/);
  assert.equal(jsonLd(html).name, hostile);
  assert.ok(html.includes('\\u003c/script\\u003e'));
  assert.equal((html.match(/id="product-structured-data"/g) || []).length, 1);
  const renderedTwice = renderProductHtml(html, metadata);
  assert.equal((renderedTwice.match(/id="product-structured-data"/g) || []).length, 1);
});

test('shared metadata rejects executable image URLs and retains valid product offer pricing', () => {
  const metadata = productMetadata({ ...product, images: ['javascript:alert(1)'], priceVariations: [
    { price: 32000, pieces: 3 }, { price: 60000, pieces: 6 }
  ] });
  assert.equal(metadata.image, brand.url + brand.image);
  assert.equal(metadata.structuredData.offers[0].price, 32000);
  assert.equal(metadata.structuredData.offers[0].availability, 'https://schema.org/InStock');
  assert.equal(metadata.structuredData.offers[1].availability, 'https://schema.org/OutOfStock');
});

test('malformed, missing, repeated and injected IDs return 404 without contacting the catalog', async () => {
  for (const requestedId of ['', ['one', 'two'], '../secret', '" onload="bad', '507f1f77bcf86cd79943901']) {
    const res = response();
    await preview(() => { throw Error('Should not fetch'); })(request('GET', requestedId), res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body, /Product not found/);
    assert.equal(res.headers['x-robots-tag'], 'noindex');
    assert.equal(res.headers['cache-control'], 'no-store');
    assert.doesNotMatch(res.body, /id="product-structured-data"/);
  }
  const res = response();
  await preview(() => { throw Error('Should not fetch'); })({ method: 'GET', url: '/api/product', query: {} }, res);
  assert.equal(res.statusCode, 404);
});

test('public product paths override incoming query IDs while literal API requests support query IDs', async () => {
  for (const url of [`/product/${id}?id=${anotherId}`, `/product/${id}/?id=${anotherId}`, `/product/${id.toUpperCase()}`]) {
    let fetched;
    const handler = preview(async endpoint => {
      fetched = endpoint;
      return upstream(product)();
    });
    const res = response();
    await handler({ method: 'GET', url, query: { id: anotherId } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(fetched, `https://anjola-backend.onrender.com/api/products/${id}`);
    assert.equal(jsonLd(res.body).sku, id);
  }
  for (const url of ['/product/bad-id', '/product/%ZZ', '/product/bad/extra', '/unrelated']) {
    const res = response();
    await preview(() => { throw Error('Should not fetch'); })({ method: 'GET', url, query: { id } }, res);
    assert.equal(res.statusCode, 404);
  }
  const api = response();
  await preview(upstream(product))({ method: 'GET', url: `/api/product?id=${id}`, query: { id } }, api);
  assert.equal(api.statusCode, 200);
  assert.equal(jsonLd(api.body).sku, id);
});

test('deleted and hidden products return noindex 404 while sold-out products remain shareable', async () => {
  const missing = async () => ({ ok: false, status: 404 });
  for (const fetchImpl of [missing, upstream(null), upstream({ ...product, visible: false })]) {
    const res = response();
    await preview(fetchImpl)(request(), res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(res.body, /id="product-structured-data"/);
    assert.doesNotMatch(res.body, /Rose travel cup/);
  }
  const res = response();
  await preview(upstream({ ...product, inStock: false, quantity: 0 }))(request(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(jsonLd(res.body).offers.availability, 'https://schema.org/OutOfStock');
});

test('upstream failures, wrong-product responses and unavailable build output fail with retryable 503', async () => {
  for (const fetchImpl of [
    async () => { throw Error('Network or timeout'); },
    async () => ({ ok: false, status: 500 }),
    async () => ({ ok: true, status: 200, json: async () => { throw Error('Invalid JSON'); } }),
    upstream({ ...product, _id: anotherId })
  ]) {
    const res = response();
    await preview(fetchImpl)(request(), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers['retry-after'], '60');
    assert.equal(res.headers['x-robots-tag'], 'noindex');
    assert.equal(res.headers['cache-control'], 'no-store');
    assert.match(res.body, /Product temporarily unavailable/);
    assert.doesNotMatch(res.body, /Rose travel cup|id="product-structured-data"/);
  }
  const res = response();
  await createProductHandler({ fetchImpl: upstream(product), readTemplate: () => { throw Error('Missing build'); } })(request(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers['x-robots-tag'], 'noindex');
});

test('HEAD uses the GET status and headers but emits no response body', async () => {
  for (const fetchImpl of [upstream(product), upstream(null), async () => { throw Error('Unavailable'); }]) {
    const get = response();
    const head = response();
    const handler = preview(fetchImpl);
    await handler(request('GET'), get);
    await handler(request('HEAD'), head);
    assert.equal(head.statusCode, get.statusCode);
    assert.deepEqual(head.headers, get.headers);
    assert.equal(head.body, undefined);
  }
});

test('unsupported methods return 405 before accessing the backend or template', async () => {
  for (const handler of [preview(() => { throw Error('Should not fetch'); }), createSitemapHandler({ fetchImpl: () => { throw Error('Should not fetch'); } })]) {
    const res = response();
    await handler(request('POST'), res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.allow, 'GET, HEAD');
    assert.equal(res.headers['cache-control'], 'no-store');
  }
});

test('sitemap includes public pages and unique visible products, including sold-out items', async () => {
  const res = response();
  const handler = createSitemapHandler({ fetchImpl: upstream([
    product, { ...product, _id: id.toUpperCase() },
    { ...product, _id: anotherId, quantity: 0, inStock: false },
    { ...product, _id: '507f1f77bcf86cd799439013', visible: false },
    { ...product, _id: '</loc><script>bad</script>' }, null
  ]) });
  await handler(request(), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /application\/xml/);
  for (const route of Object.keys(brand.pages)) assert.ok(res.body.includes(`<loc>${brand.url}${route}</loc>`));
  assert.equal(res.body.split(`<loc>${brand.url}/product/${id}</loc>`).length - 1, 1);
  assert.ok(res.body.includes(`<loc>${brand.url}/product/${anotherId}</loc>`));
  assert.doesNotMatch(res.body, /507f1f77bcf86cd799439013|<script>|\/checkout|\/admin/);
  const head = response();
  await handler(request('HEAD'), head);
  assert.deepEqual(head.headers, res.headers);
  assert.equal(head.body, undefined);
});

test('sitemap reflects product additions and removals on subsequent origin requests', async () => {
  let current = [product];
  const handler = createSitemapHandler({ fetchImpl: async () => upstream(current)() });
  const before = response();
  await handler(request(), before);
  assert.ok(before.body.includes(id));
  current = [{ ...product, _id: anotherId }];
  const after = response();
  await handler(request(), after);
  assert.ok(after.body.includes(anotherId));
  assert.ok(!after.body.includes(id));
});

test('failed or malformed sitemap sources return 503 instead of publishing incomplete results', async () => {
  for (const fetchImpl of [
    async () => { throw Error('Network or timeout'); },
    async () => ({ ok: false, status: 500 }),
    async () => ({ ok: false, status: 404 }),
    upstream(undefined), upstream({ products: [] })
  ]) {
    const res = response();
    await createSitemapHandler({ fetchImpl })(request(), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers['retry-after'], '60');
    assert.equal(res.headers['cache-control'], 'no-store');
    assert.doesNotMatch(res.body, /<urlset>/);
  }
  const res = response();
  await createSitemapHandler({ fetchImpl: upstream([]) })(request(), res);
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes(`<loc>${brand.url}/shop</loc>`));
});

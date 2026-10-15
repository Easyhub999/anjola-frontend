import { applyPageMetadata, pageMetadata } from './siteMetadata';

beforeEach(() => { document.head.innerHTML = '<title>Old title</title><meta name="description" content="Old copy"><link rel="canonical" href="https://anjolaaestheticsng.com/">'; });
test('navigation updates existing metadata without duplicate canonicals or descriptions', () => {
  applyPageMetadata(pageMetadata('/shop/'));
  expect(document.title).toContain('Shop Gifts, Bags');
  expect(document.querySelector('link[rel="canonical"]').href).toBe('https://anjolaaestheticsng.com/shop');
  applyPageMetadata(pageMetadata('/blog'));
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  expect(document.querySelector('meta[property="og:title"]').content).toBe(document.title);
  expect(document.querySelector('meta[name="description"]').content).toContain('gifting ideas');
});
test.each(['/auth','/profile','/checkout','/admin','/admin-orders','/admin-analytics','/product','/unknown'])('%s is not advertised as a public search landing page', route => {
  expect(pageMetadata(route).robots).toBe('noindex, follow');
});
test('returning from an account page restores public indexing', () => {
  applyPageMetadata(pageMetadata('/profile'));
  applyPageMetadata(pageMetadata('/'));
  expect(document.querySelector('meta[name="robots"]').content).toBe('index, follow');
  expect(document.title).not.toMatch(/Self-Care|Skincare/);
});

test('product metadata is specific and removed when navigating back to shop', () => {
  const id = '507f1f77bcf86cd799439011';
  const product = { _id: id, name: 'Rose tumbler', description: 'A cup for your daily pause.', images: ['https://example.com/cup.jpg'], price: 5000, quantity: 3 };
  applyPageMetadata(pageMetadata(`/product/${id}`, product));
  expect(document.title).toBe('Rose tumbler | Anjola Aesthetics Ng');
  expect(document.querySelector('meta[property="og:image"]').content).toBe('https://example.com/cup.jpg');
  expect(document.querySelector('meta[property="og:image:width"]')).toBeNull();
  expect(JSON.parse(document.getElementById('product-structured-data').textContent).offers.priceCurrency).toBe('NGN');
  applyPageMetadata(pageMetadata('/shop'));
  expect(document.getElementById('product-structured-data')).toBeNull();
  expect(document.querySelector('meta[property="og:image"]').content).toContain('anjola-social-v4.png');
});

test('pack structured data reports pack prices and stock rather than invented per-piece prices', () => {
  const id = '507f1f77bcf86cd799439011';
  const product = { _id: id, name: 'Gift boxes', price: 1000, salesPrice: 500, quantity: 4, colors: [{ name: 'Pink', quantity: 4 }], priceVariations: [{pieces: 3, price: 2400}, {pieces: 6, price: 4500}] };
  const { offers } = pageMetadata(`/product/${id}`, product).structuredData;
  expect(offers.map(offer => offer.price)).toEqual([2400,4500]);
  expect(offers[0].availability).toMatch(/InStock$/);
  expect(offers[1].availability).toMatch(/OutOfStock$/);
});

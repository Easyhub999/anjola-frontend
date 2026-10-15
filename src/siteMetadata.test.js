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

import brand from './branding.json';
import { productMetadata } from './productSeo';

export function pageMetadata(pathname, product) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (product && path === `/product/${encodeURIComponent(product._id)}` && product.visible !== false) return productMetadata(product);
  const page = brand.pages[path];
  const editorTitle = { '/admin-orders/new': 'Create order', '/admin/products/new': 'Add product' }[path];
  const title = path === '/product' && product?.name ? product.name : editorTitle || brand.privatePages[path] || 'Page';
  return {
    title: page?.title || `${title} | ${brand.name}`,
    description: page?.description || brand.description,
    canonical: `${brand.url}${path === '/' ? '/' : path}`,
    robots: page ? 'index, follow' : 'noindex, follow',
  };
}

// Update the existing HTML tags so navigation never creates competing metadata.
export function applyPageMetadata(metadata) {
  document.title = metadata.title;
  const meta = (attribute, name, content) => {
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element); }
    element.setAttribute('content', content);
  };
  meta('name', 'description', metadata.description);
  meta('name', 'robots', metadata.robots);
  meta('property', 'og:title', metadata.title);
  meta('property', 'og:type', metadata.structuredData ? 'product' : 'website');
  meta('property', 'og:description', metadata.description);
  meta('property', 'og:url', metadata.canonical);
  meta('name', 'twitter:title', metadata.title);
  meta('name', 'twitter:description', metadata.description);
  const image = metadata.image || brand.url + brand.image;
  const imageAlt = metadata.imageAlt || brand.imageAlt;
  meta('property', 'og:image', image);
  meta('property', 'og:image:alt', imageAlt);
  meta('name', 'twitter:image', image);
  meta('name', 'twitter:image:alt', imageAlt);
  // Product photos have their own dimensions and format; don't label them as the brand card.
  for (const field of ['width', 'height', 'type']) document.querySelector(`meta[property="og:image:${field}"]`)?.remove();
  if (image === brand.url + brand.image) {
    meta('property', 'og:image:width', '1200'); meta('property', 'og:image:height', '630'); meta('property', 'og:image:type', 'image/png');
  }
  document.getElementById('product-structured-data')?.remove();
  if (metadata.structuredData) {
    const script = document.createElement('script');
    script.id = 'product-structured-data'; script.type = 'application/ld+json';
    script.textContent = JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c');
    document.head.appendChild(script);
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = metadata.canonical;
}

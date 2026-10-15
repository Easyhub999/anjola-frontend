import brand from './branding.json';

export function pageMetadata(pathname, product) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const page = brand.pages[path];
  const title = path === '/product' && product?.name ? product.name : brand.privatePages[path] || 'Page';
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
  meta('property', 'og:description', metadata.description);
  meta('property', 'og:url', metadata.canonical);
  meta('name', 'twitter:title', metadata.title);
  meta('name', 'twitter:description', metadata.description);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = metadata.canonical;
}

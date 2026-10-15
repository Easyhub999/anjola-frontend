import { useEffect, useState } from 'react';
import { productsAPI } from '../api';
import { applyPageMetadata } from '../siteMetadata';
import { productMetadata } from '../productSeo';
import { productUrl } from '../productLinks';
import brand from '../branding.json';
import ProductDetailPage from './ProductDetailPage';

export default function ProductRoute({ productId, onResolved, ...detailProps }) {
  const [result, setResult] = useState({ id: null, status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const base = { title: `Product | ${brand.name}`, description: brand.description, canonical: productUrl(productId), robots: 'noindex, follow' };
    setResult({ id: productId, status: 'loading' });
    // Keep the server-rendered metadata on a direct visit; discard another item's tags on SPA navigation.
    if (document.querySelector('link[rel="canonical"]')?.href !== base.canonical) applyPageMetadata(base);
    const fail = status => {
      setResult({ id: productId, status });
      applyPageMetadata({ ...base, title: `${status === 'missing' ? 'Product unavailable' : 'Unable to load product'} | ${brand.name}` });
    };
    if (!/^[a-f\d]{24}$/i.test(productId || '')) { fail('missing'); return () => { active = false; }; }
    const timeout = setTimeout(() => { if (active) { fail('error'); controller.abort(); } }, 15000);
    productsAPI.getProduct(productId, { signal: controller.signal }).then(product => {
      clearTimeout(timeout);
      if (!active || controller.signal.aborted) return;
      if (!product || String(product._id).toLowerCase() !== productId.toLowerCase() || product.visible === false) { fail('missing'); return; }
      setResult({ id: productId, status: 'ready', product });
      applyPageMetadata(productMetadata(product));
      onResolved?.(product);
    }).catch(error => {
      clearTimeout(timeout);
      if (!active || error.name === 'AbortError') return;
      fail(error.status === 404 ? 'missing' : 'error');
    });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [productId, attempt, onResolved]);

  const status = result.id === productId ? result.status : 'loading';
  if (status === 'ready') return <ProductDetailPage {...detailProps} selectedProduct={result.product} />;
  return <main className="pd-empty" aria-live="polite">
    {status === 'loading' ? <><h1>Finding your little joy…</h1><p>Loading the latest product details.</p></> : <>
      <h1>{status === 'missing' ? 'This item is currently unavailable.' : 'We couldn’t load this item.'}</h1>
      <p>{status === 'missing' ? 'It may have been removed from the collection. Explore the shop for something else you’ll love.' : 'Please try again. Your connection or the store may be temporarily unavailable.'}</p>
      {status === 'error' && <button onClick={() => setAttempt(value => value + 1)}>Try again</button>}
      <a href="/shop">Explore the collection</a>
    </>}
  </main>;
}

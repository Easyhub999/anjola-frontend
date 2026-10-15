import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, ChevronLeft, ChevronRight, Heart, ArrowUpRight } from 'lucide-react';
import { productPresentation, formatPrice } from '../productPresentation';
import { productPath } from '../productLinks';
import '../pages/ShopPage.css';

const QuickViewModal = ({ product, onClose, addToCart, setCurrentPage, setSelectedProduct, isWishlisted, toggleWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const touchStart = useRef(null);
  const timer = useRef(null);
  closeRef.current = onClose;
  const productId = product?._id;

  useEffect(() => {
    if (!productId) return;
    setCurrentImageIndex(0); setAdded(false);
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...(dialogRef.current?.querySelectorAll('button:not([disabled]), a[href]') || [])];
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer.current);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [productId]);

  if (!product) return null;
  const { price, hasPacks, onSale, available, hasOptions } = productPresentation(product);
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const imageIndex = Math.min(currentImageIndex, Math.max(0, images.length - 1));
  const wishlisted = isWishlisted?.(product._id) || false;
  const viewDetails = event => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    localStorage.setItem('cameFromShop', 'true');
    setSelectedProduct(product); setCurrentPage(productPath(product).slice(1)); onClose();
  };
  const add = () => {
    if (!available) return;
    if (hasOptions) { viewDetails(); return; }
    if (addToCart(product) === false) return;
    setAdded(true); clearTimeout(timer.current); timer.current = setTimeout(() => setAdded(false), 1500);
  };
  const move = delta => { if (images.length) setCurrentImageIndex((imageIndex + delta + images.length) % images.length); };

  return createPortal(<div className="shop-quickview-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} className="shop-quickview-dialog" role="dialog" aria-modal="true" aria-labelledby="quickview-title">
      <button className="shop-quickview-close" aria-label="Close quick view" onClick={onClose}><X size={22} /></button>
      <div className="shop-quickview-gallery" onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => {
        if (touchStart.current === null) return;
        const distance = touchStart.current - event.changedTouches[0].clientX;
        if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1);
        touchStart.current = null;
      }}>
        {images.length ? <img src={images[imageIndex]} alt={`${product.name}, view ${imageIndex + 1}`} /> : <ShoppingBag size={48} strokeWidth={1} />}
        {toggleWishlist && <button className="shop-wishlist" aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={wishlisted} onClick={() => toggleWishlist(product)}><Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} /></button>}
        {images.length > 1 && <div className="shop-gallery-controls"><button aria-label="Previous image" onClick={() => move(-1)}><ChevronLeft size={21} /></button><span aria-live="polite">{imageIndex + 1} / {images.length}</span><button aria-label="Next image" onClick={() => move(1)}><ChevronRight size={21} /></button></div>}
      </div>
      <div className="shop-quickview-copy">
        <p className="shop-eyebrow">{product.category}</p><h2 id="quickview-title">{product.name}</h2>
        <p className="shop-price">{hasPacks && <span>From </span>}{formatPrice(price)}{onSale && <del>{formatPrice(product.price)}</del>}</p>
        {hasPacks && <p className="shop-pack-note">Price per pack. Choose your pack size on the product page.</p>}
        <p className="shop-quickview-description">{product.description}</p>
        <p className="shop-availability">{available ? 'Available to order' : 'Currently unavailable'}</p>
        {hasOptions && <p className="shop-options-note">Choose your {['sizes', 'colors', 'priceVariations'].filter(key => product[key]?.length).map(key => ({ sizes: 'size', colors: 'color', priceVariations: 'pack' }[key])).join(', ')} before adding to your bag.</p>}
        <div className="shop-quickview-actions"><button className="shop-card-action" disabled={!available} onClick={add}>{!available ? 'Currently unavailable' : added ? 'Added to bag' : hasOptions ? 'Choose options' : 'Add to bag'}<ShoppingBag size={18} /></button><span className="sr-only" role="status">{added ? `${product.name} added to bag` : ''}</span><a className="shop-details-link" href={productPath(product)} onClick={viewDetails}>View full details <ArrowUpRight size={17} /></a></div>
      </div>
    </div>
  </div>, document.body);
};
export default QuickViewModal;

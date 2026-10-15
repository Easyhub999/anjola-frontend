import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { productsAPI } from '../api';
import BackButton from '../components/BackButton';
import { Heart, Share2, ShoppingBag, Truck, Gift, Star, ChevronDown, ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { productPresentation, formatPrice } from '../productPresentation';
import { canSelectPack, selectionPrice } from '../productSelection';
import { productPath, productUrl } from '../productLinks';
import './ProductDetailPage.css';

const ProductDetailPage = ({ selectedProduct: product, setCurrentPage, user, addToCart, toggleWishlist, isWishlisted, products = [], setSelectedProduct }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [added, setAdded] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState(product?.reviews || []);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const timer = useRef(null);
  const touchX = useRef(null);
  const lightboxRef = useRef(null);
  const optionsRef = useRef(null);
  const reviewRequest = useRef(0);
  const images = product?.images?.length ? product.images : product?.image ? [product.image] : [];
  const safeIndex = Math.min(imageIndex, Math.max(0, images.length - 1));

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageIndex(0); setShowLightbox(false); setSelectedSize(null); setSelectedColor(null); setSelectedVariation(null);
    setAdded(false); setSelectionError(''); setShowReviews(false); setReviews(product?.reviews || []);
    setReviewForm({ name: '', rating: 5, comment: '' }); setErrorMsg(''); setReviewMessage(''); setLoadingReview(false); setShareMessage('');
    return () => { clearTimeout(timer.current); reviewRequest.current += 1; };
    // Reset selections on a different product, not on a refreshed product record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  useEffect(() => {
    document.body.classList.add('has-product-detail');
    return () => document.body.classList.remove('has-product-detail');
  }, []);

  useEffect(() => {
    if (!showLightbox) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxRef.current?.querySelector('button')?.focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setShowLightbox(false); }
      if (images.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); setImageIndex(index => (index + (event.key === 'ArrowRight' ? 1 : -1) + images.length) % images.length);
      }
      if (event.key === 'Tab') {
        const buttons = [...lightboxRef.current.querySelectorAll('button')];
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [showLightbox, images.length]);

  const handleReviewSubmit = async event => {
    event.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) { setErrorMsg('Please enter your name and a comment.'); return; }
    const request = ++reviewRequest.current;
    setLoadingReview(true); setErrorMsg(''); setReviewMessage('');
    try {
      const updated = await productsAPI.addReview(product._id, { name: reviewForm.name.trim(), rating: Number(reviewForm.rating), comment: reviewForm.comment.trim() }, user?.token);
      if (request !== reviewRequest.current) return;
      if (updated?.reviews) setReviews(updated.reviews);
      setReviewForm({ name: '', rating: 5, comment: '' }); setReviewMessage('Thank you. Your review was submitted.');
    } catch (error) { if (request === reviewRequest.current) setErrorMsg(error.message || 'Unable to submit review. Please try again.'); }
    finally { if (request === reviewRequest.current) setLoadingReview(false); }
  };

  if (!product) return <div className="pd-empty"><p>Choose a product to see its details.</p><button onClick={() => setCurrentPage('shop')}>Back to shop</button></div>;
  const presentation = productPresentation(product);
  const pricing = selectionPrice(product, selectedVariation);
  const packs = product.priceVariations || [];
  const colors = (product.colors || []).map(color => typeof color === 'string' ? { name: color } : color);
  const minimumPieces = packs.length ? Math.min(...packs.map(pack => pack.pieces)) : 1;
  const requiredPieces = selectedVariation?.pieces || minimumPieces;
  const complete = (!product.sizes?.length || Boolean(selectedSize)) && (!colors.length || Boolean(selectedColor)) && (!packs.length || Boolean(selectedVariation));
  const selectionAvailable = canSelectPack(product, requiredPieces, selectedColor);
  const wishlisted = isWishlisted?.(product._id) || false;
  const missing = [product.sizes?.length && !selectedSize && 'size', colors.length && !selectedColor && 'color', packs.length && !selectedVariation && 'pack'].filter(Boolean);
  const unitText = pricing.starting ? 'Starting price per pack' : packs.length ? `Price for ${pricing.pieces} ${pricing.pieces === 1 ? 'piece' : 'pieces'}` : 'Price per item';
  const addLabel = !presentation.available ? 'Currently unavailable' : !selectionAvailable ? 'Selection unavailable' : added ? 'Added to bag' : !complete ? 'Choose options' : 'Add to bag';
  const clearFeedback = () => { setSelectionError(''); setAdded(false); };
  const add = () => {
    if (!presentation.available || !selectionAvailable) return;
    if (!complete) {
      setSelectionError(`Please choose your ${missing.join(', ')}.`);
      optionsRef.current?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      optionsRef.current?.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
      return;
    }
    if (addToCart({ ...product, selectedSize, selectedColor, selectedPieces: selectedVariation?.pieces || 1, pricePerPiece: pricing.perPiece, price: pricing.price }) === false) return;
    setAdded(true); setSelectionError(''); clearTimeout(timer.current); timer.current = setTimeout(() => setAdded(false), 2000);
  };
  const share = async () => {
    try {
      const url = productUrl(product);
      if (navigator.share) await navigator.share({ title: product.name, text: `Take a look at ${product.name} on Anjola Aesthetics.`, url });
      else { await navigator.clipboard.writeText(url); setShareMessage('Product link copied.'); }
    } catch (error) { if (error.name !== 'AbortError') setShareMessage('Unable to share. Copy the product link from your browser address bar.'); }
  };
  const openRelatedProduct = (item, event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setSelectedProduct(item);
    setCurrentPage(productPath(item).slice(1));
  };
  const move = delta => { if (images.length > 1) setImageIndex((safeIndex + delta + images.length) % images.length); };
  const related = products.filter(p => p._id !== product._id && p.visible !== false).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 6);

  return <div className="pd-page">
    <div className="pd-container"><BackButton setCurrentPage={setCurrentPage} />
      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-main-photo" onTouchStart={event => { touchX.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touchX.current !== null) { const delta = touchX.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 50) move(delta > 0 ? 1 : -1); } touchX.current = null; }}>
            {images.length ? <button onClick={() => setShowLightbox(true)} aria-label={`Enlarge ${product.name}`}><img src={images[safeIndex]} alt={`${product.name}, view ${safeIndex + 1}`} /><span className="pd-zoom-hint"><Expand size={15} /> Enlarge</span></button> : <ShoppingBag size={50} strokeWidth={1} />}
            {!presentation.available && <span className="pd-unavailable">Currently unavailable</span>}
          </div>
          {images.length > 1 && <><div className="pd-gallery-navigation"><button aria-label="Previous product photo" onClick={() => move(-1)}><ChevronLeft size={20} /></button><span aria-live="polite">{safeIndex + 1} / {images.length}</span><button aria-label="Next product photo" onClick={() => move(1)}><ChevronRight size={20} /></button></div><div className="pd-thumbnails">{images.map((src, index) => <button key={`${src}-${index}`} aria-label={`Show view ${index + 1}`} aria-pressed={safeIndex === index} onClick={() => setImageIndex(index)}><img src={src} alt="" loading="lazy" /></button>)}</div></>}
        </div>
        <div className="pd-info">
          <p className="pd-eyebrow">{product.category}</p>
          <div className="pd-title"><h1>{product.name}</h1><div>{toggleWishlist && <button aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={wishlisted} onClick={() => toggleWishlist(product)}><Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} /></button>}<button onClick={share} aria-label="Share product"><Share2 size={19} /></button></div></div>
          {shareMessage && <p className="pd-feedback" role="status">{shareMessage}</p>}
          {reviews.length > 0 && <button className="pd-rating" onClick={() => setShowReviews(true)}><Star size={15} />{(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</button>}
          <div className="pd-price-panel"><span>{unitText}</span><p>{pricing.starting && <small>From </small>}{formatPrice(pricing.price)}{pricing.onSale && <del>{formatPrice(product.price)}</del>}</p>{selectedVariation && selectedVariation.pieces > 1 && <span>Approx. {formatPrice(Math.round(pricing.perPiece * 100) / 100)} per piece</span>}{pricing.savings > 0 && <div className="pd-savings">Save {formatPrice(pricing.savings)}{packs.length ? ' compared with individual packs' : ''}</div>}</div>
          <p className="pd-stock">{!presentation.available ? 'Currently unavailable' : !selectionAvailable ? 'Not enough stock for this selection. Choose another option.' : 'Available to order'} · Delivery calculated at checkout</p>
          <div ref={optionsRef} className="pd-options">
            {packs.length > 0 && <fieldset><legend>Choose your pack {selectedVariation && <span>· {selectedVariation.pieces} pieces</span>}</legend><div className="pd-pack-grid">{packs.map(pack => <button key={pack.pieces} aria-pressed={selectedVariation?.pieces === pack.pieces} disabled={!canSelectPack(product, pack.pieces, selectedColor)} onClick={() => { setSelectedVariation(pack); clearFeedback(); }}><strong>{pack.pieces} {pack.pieces === 1 ? 'piece' : 'pieces'}</strong><span>{formatPrice(pack.price)}</span>{pack.label && <small>{pack.label}</small>}{!canSelectPack(product, pack.pieces, selectedColor) && <small>Unavailable</small>}</button>)}</div></fieldset>}
            {product.sizes?.length > 0 && <fieldset><legend>Choose your size</legend><div className="pd-option-row">{product.sizes.map(size => <button key={size} aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(selectedSize === size ? null : size); clearFeedback(); }}>{size}</button>)}</div></fieldset>}
            {colors.length > 0 && <fieldset><legend>Choose your color {selectedColor && <button className="pd-clear-color" onClick={() => { setSelectedColor(null); clearFeedback(); }}>Clear color</button>}</legend><div className="pd-option-row">{colors.map(color => <button key={color.name} aria-pressed={selectedColor === color.name} disabled={!canSelectPack(product, requiredPieces, color.name)} onClick={() => { setSelectedColor(selectedColor === color.name ? null : color.name); clearFeedback(); }}>{color.name}{!canSelectPack(product, requiredPieces, color.name) && <small>Unavailable for this pack</small>}</button>)}</div></fieldset>}
          </div>
          {selectionError && <p className="pd-feedback" role="alert">{selectionError}</p>}
          <div className="pd-inline-buy"><button className="pd-buy" disabled={!presentation.available || !selectionAvailable} onClick={add}>{addLabel}<ShoppingBag size={18} /></button><p role="status">{added ? `${product.name} added to your bag.` : complete && packs.length ? `One pack contains ${pricing.pieces} pieces.` : missing.length ? `Select ${missing.join(', ')} to continue.` : 'Ready when you are.'}</p></div>
          <div className="pd-help-notes"><p><Gift size={17} /> Add a gift message at checkout.</p><p><Truck size={17} /> Select delivery for your location at checkout.</p></div>
          <details className="pd-details" open><summary>Description</summary><p>{product.description || 'Contact Anjola for more information about this product.'}</p></details>
          <details className="pd-details"><summary>Delivery & gifting</summary><p>Available delivery options and charges are shown at checkout. Contact Anjola to confirm timing for your location or a special occasion before ordering.</p><button onClick={() => setCurrentPage('contact')}>Ask about this product</button></details>
          <div className="pd-reviews">
              {/* Reviews */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button aria-expanded={showReviews} aria-controls="product-reviews" onClick={() => setShowReviews(!showReviews)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-800 text-sm">Reviews ({reviews?.length || 0})</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showReviews ? 'rotate-180' : ''}`} />
                </button>
                {showReviews && (
                  <div id="product-reviews" className="pd-reviews-panel">
                    {reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((rev, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#e84393] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {rev.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{rev.name}</p>
                                  <p className="text-gray-400 text-xs">{new Date(rev.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex">{[...Array(5)].map((_, si) => (
                                <Star key={si} className={`w-3 h-3 ${si < rev.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                              ))}</div>
                            </div>
                            <p className="text-gray-600 text-sm">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-400 text-sm text-center py-4">No reviews yet. Be the first!</p>}

                    {/* Review Form */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 text-sm mb-3">Write a Review</h4>
                      {errorMsg && <p role="alert" className="text-red-500 text-xs mb-2">{errorMsg}</p>}
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <input aria-label="Your name" type="text" placeholder="Your name" value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#e84393] focus:ring-1 focus:ring-[#e84393]/10 outline-none" />
                        <select aria-label="Review rating" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#e84393] outline-none">
                          <option value={5}>5 Stars — Excellent</option>
                          <option value={4}>4 Stars — Very Good</option>
                          <option value={3}>3 Stars — Good</option>
                          <option value={2}>2 Stars — Fair</option>
                          <option value={1}>1 Star — Poor</option>
                        </select>
                        <textarea aria-label="Your review" placeholder="Your review..." rows={3} value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#e84393] outline-none resize-none" />
                        <button type="submit" disabled={loadingReview}
                          className="w-full bg-[#e84393] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#d63384] transition-colors disabled:opacity-50">
                          {loadingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            {reviewMessage && <p className="pd-feedback" role="status">{reviewMessage}</p>}
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="pd-related" aria-labelledby="related-title"><p className="pd-eyebrow">KEEP EXPLORING</p><h2 id="related-title">Something else you might love.</h2><div>{related.map(item => <a key={item._id} href={productPath(item)} onClick={event => openRelatedProduct(item, event)}>{item.images?.[0] || item.image ? <img src={item.images?.[0] || item.image} alt="" loading="lazy" /> : <ShoppingBag size={40} />}<span>{item.name}</span><small>{productPresentation(item).hasPacks ? 'From ' : ''}{formatPrice(productPresentation(item).price)}</small></a>)}</div></section>}
    </div>
    {createPortal(<div className="pd-mobile-buy"><div><small>{pricing.starting ? 'From / pack' : packs.length ? `${pricing.pieces}-piece pack` : 'Price per item'}</small><strong>{formatPrice(pricing.price)}</strong></div><button className="pd-buy" disabled={!presentation.available || !selectionAvailable} onClick={add}>{addLabel}</button></div>, document.body)}
    {showLightbox && createPortal(<div className="pd-lightbox" ref={lightboxRef} role="dialog" aria-modal="true" aria-label={`${product.name} gallery`} onClick={event => { if (event.target === event.currentTarget) setShowLightbox(false); }}><button className="pd-lightbox-close" aria-label="Close gallery" onClick={() => setShowLightbox(false)}><X size={24} /></button><img src={images[safeIndex]} alt={`${product.name}, view ${safeIndex + 1}`} /><div className="pd-lightbox-controls">{images.length > 1 && <button aria-label="Previous enlarged photo" onClick={() => move(-1)}><ChevronLeft size={24} /></button>}<span aria-live="polite">{safeIndex + 1} / {images.length}</span>{images.length > 1 && <button aria-label="Next enlarged photo" onClick={() => move(1)}><ChevronRight size={24} /></button>}</div></div>, document.body)}
  </div>;
};
export default ProductDetailPage;

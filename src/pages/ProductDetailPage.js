import { useState, useEffect, useRef } from "react";
import { productsAPI } from "../api";
import BackButton from "../components/BackButton";
import { Heart, Share2, ShoppingBag, Truck, Shield, Star, ChevronDown, AlertTriangle } from "lucide-react";

const ProductDetailPage = ({
  selectedProduct, setCurrentPage, user, addToCart,
  toggleWishlist, isWishlisted, products, setSelectedProduct
}) => {
  const hasProduct = !!selectedProduct;

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    const t = setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 100);
    return () => clearTimeout(t);
  }, [selectedProduct?._id]);

  // Images
  const allImages = hasProduct
    ? (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 ? selectedProduct.images : selectedProduct.image ? [selectedProduct.image] : ["/placeholder.png"])
    : ["/placeholder.png"];

  const [mainImage, setMainImage] = useState(allImages[0]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Image zoom state
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Touch swipe for mobile gallery
  const [touchStartX, setTouchStartX] = useState(null);
  const handleSwipeStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleSwipeEnd = (e) => {
    if (!touchStartX) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      const currentIdx = allImages.indexOf(mainImage);
      if (diff > 0 && currentIdx < allImages.length - 1) {
        setMainImage(allImages[currentIdx + 1]); setImageLoaded(false);
      } else if (diff < 0 && currentIdx > 0) {
        setMainImage(allImages[currentIdx - 1]); setImageLoaded(false);
      }
    }
    setTouchStartX(null);
  };

  // Stock & visibility
  const isHidden = hasProduct && selectedProduct.visible === false;
  const stock = hasProduct ? Number(selectedProduct.quantity ?? 0) : 0;
  const isOutOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;

  // Selections
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const hasPriceVariations = hasProduct && selectedProduct.priceVariations && selectedProduct.priceVariations.length > 0;

  useEffect(() => {
    if (hasPriceVariations && !selectedVariation) {
      setSelectedVariation(selectedProduct.priceVariations[0]);
    }
  }, [hasPriceVariations, selectedProduct, selectedVariation]);

  // Colors
  const getColors = () => {
    if (!hasProduct || !selectedProduct.colors) return [];
    return selectedProduct.colors.map(color => {
      if (typeof color === 'string') return { name: color, quantity: 999, isOldFormat: true };
      return { name: color.name, quantity: color.quantity || 0, isOldFormat: false };
    });
  };

  const colors = getColors();
  const hasColors = colors.length > 0;
  const isSelectedColorInStock = () => {
    if (!selectedColor) return true;
    const colorObj = colors.find(c => c.name === selectedColor);
    return colorObj ? colorObj.quantity > 0 : true;
  };

  const getDisplayPrice = () => selectedVariation ? selectedVariation.price : (hasProduct ? selectedProduct.price : 0);
  const getPricePerPiece = () => selectedVariation ? Math.round(selectedVariation.price / selectedVariation.pieces) : (hasProduct ? selectedProduct.price : 0);
  const getSavings = () => {
    if (!selectedVariation || !hasProduct || selectedVariation.pieces <= 1) return 0;
    return selectedProduct.price * selectedVariation.pieces - selectedVariation.price;
  };

  const handleAddToCart = () => {
    if (!hasProduct || isHidden || isOutOfStock) return;
    if (hasPriceVariations && !selectedVariation) { alert('Please select a quantity option'); return; }
    if (hasColors) {
      if (!selectedColor) { alert('Please select a color'); return; }
      if (!isSelectedColorInStock()) { alert('Selected color is out of stock'); return; }
    }
    const cartItem = {
      ...selectedProduct, selectedSize, selectedColor,
      selectedPieces: selectedVariation ? selectedVariation.pieces : 1,
      pricePerPiece: getPricePerPiece(),
      price: getDisplayPrice(),
    };
    addToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Share
  const handleShare = async () => {
    const shareData = {
      title: selectedProduct.name,
      text: `Check out ${selectedProduct.name} on Anjola Aesthetics!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Lightbox
  const openLightbox = (index) => { setLightboxIndex(index); setShowLightbox(true); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setShowLightbox(false); document.body.style.overflow = 'unset'; };
  const navigateLightbox = (direction) => {
    setLightboxIndex(direction === 'next' ? (lightboxIndex + 1) % allImages.length : (lightboxIndex - 1 + allImages.length) % allImages.length);
  };

  // Reviews
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!hasProduct) return;
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) { setErrorMsg("Please enter your name and a comment."); return; }
    try {
      setLoadingReview(true); setErrorMsg("");
      const updated = await productsAPI.addReview(selectedProduct._id, {
        name: reviewForm.name.trim(), rating: Number(reviewForm.rating), comment: reviewForm.comment.trim()
      }, user?.token);
      if (updated?.reviews) selectedProduct.reviews = updated.reviews;
      setReviewForm({ name: "", rating: 5, comment: "" });
      alert("Review submitted!");
    } catch (err) { setErrorMsg(err.message || "Failed to submit review"); }
    finally { setLoadingReview(false); }
  };

  const averageRating = hasProduct && selectedProduct.reviews?.length > 0
    ? (selectedProduct.reviews.reduce((sum, rev) => sum + rev.rating, 0) / selectedProduct.reviews.length).toFixed(1) : null;

  const wishlisted = isWishlisted && hasProduct ? isWishlisted(selectedProduct._id) : false;

  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff7f9]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#e84393] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f9] pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="py-4"><BackButton setCurrentPage={setCurrentPage} /></div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* LEFT: IMAGES */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="relative group rounded-2xl overflow-hidden bg-white shadow-card"
              ref={imageRef}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}>
              <img
                src={mainImage} alt={selectedProduct.name}
                onLoad={() => setImageLoaded(true)}
                onClick={() => openLightbox(allImages.indexOf(mainImage))}
                className={`w-full aspect-square object-cover cursor-zoom-in transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={zoomActive ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`, transform: 'scale(1.8)' } : {}}
              />
              {!imageLoaded && <div className="absolute inset-0 skeleton"></div>}

              {/* Badges */}
              {isOutOfStock && (
                <span className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-medium">Out of Stock</span>
              )}
              {lowStock && !isOutOfStock && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Only {stock} left!
                </span>
              )}

              {/* Swipe dot indicators (mobile) */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                  {allImages.map((img, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      mainImage === img ? 'w-5 bg-[#e84393]' : 'w-1.5 bg-white/60'
                    }`} />
                  ))}
                </div>
              )}

              {/* Zoom hint (desktop only) */}
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-gray-600 px-3 py-1.5 rounded-lg text-xs
                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                Hover to zoom
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => { setMainImage(img); setImageLoaded(false); }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                      mainImage === img ? 'ring-2 ring-[#e84393] shadow-md' : 'ring-1 ring-gray-200 hover:ring-[#e84393]/50'
                    }`}>
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="space-y-5">
            {/* Name + Actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 leading-tight">{selectedProduct.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toggleWishlist && (
                  <button onClick={() => toggleWishlist(selectedProduct)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                    }`}>
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                )}
                <button onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#e84393] hover:border-[#e84393]/30 transition-all duration-300">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">{averageRating} ({selectedProduct.reviews?.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                {hasPriceVariations && selectedVariation ? `Price for ${selectedVariation.pieces} ${selectedVariation.pieces === 1 ? 'piece' : 'pieces'}` : 'Price'}
              </p>
              {selectedProduct.salesPrice && selectedProduct.salesPrice < selectedProduct.price && !hasPriceVariations ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gray-400 line-through">₦{selectedProduct.price.toLocaleString()}</span>
                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                      SAVE {Math.round(((selectedProduct.price - selectedProduct.salesPrice) / selectedProduct.price) * 100)}%
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-red-600">₦{selectedProduct.salesPrice.toLocaleString()}</span>
                  <p className="text-sm text-emerald-600 font-medium">You save ₦{(selectedProduct.price - selectedProduct.salesPrice).toLocaleString()}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₦{getDisplayPrice().toLocaleString()}</span>
                    {hasPriceVariations && selectedVariation && selectedVariation.pieces > 1 && (
                      <span className="text-sm text-gray-500">(₦{getPricePerPiece().toLocaleString()}/pc)</span>
                    )}
                  </div>
                  {getSavings() > 0 && <p className="text-sm text-emerald-600 font-medium mt-1">You save ₦{getSavings().toLocaleString()}</p>}
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
              isOutOfStock ? 'bg-red-50 text-red-600' : lowStock ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isOutOfStock ? 'Out of stock' : lowStock ? `Hurry! Only ${stock} left in stock` : 'In stock — Ships within 2-3 business days'}
            </div>

            {/* Price Variations */}
            {hasPriceVariations && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">Select Quantity</h3>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.priceVariations.map((variation, i) => {
                    const isSelected = selectedVariation?.pieces === variation.pieces;
                    const pricePerPc = Math.round(variation.price / variation.pieces);
                    const savings = (selectedProduct.price * variation.pieces) - variation.price;
                    return (
                      <button key={i} onClick={() => setSelectedVariation(variation)}
                        className={`relative p-2.5 rounded-xl text-center transition-all duration-300 ${
                          isSelected ? 'bg-[#e84393] text-white shadow-md ring-2 ring-[#e84393]/30' : 'bg-white text-gray-700 border border-gray-200 hover:border-[#e84393]/30'
                        }`}>
                        {variation.label && (
                          <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isSelected ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'
                          }`}>{variation.label}</span>
                        )}
                        <div className={`font-bold text-sm ${variation.label ? 'mt-1' : ''}`}>{variation.pieces}pcs</div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#e84393]'}`}>₦{(variation.price / 1000).toFixed(0)}k</div>
                        <div className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>₦{pricePerPc.toLocaleString()}/pc</div>
                        {savings > 0 && <div className={`text-[9px] font-semibold ${isSelected ? 'text-amber-200' : 'text-emerald-600'}`}>Save ₦{(savings / 1000).toFixed(0)}k</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {selectedProduct.sizes?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm">Size {selectedSize && <span className="text-[#e84393] font-normal">— {selectedSize}</span>}</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.sizes.map((size, i) => (
                    <button key={i} onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size ? 'bg-[#e84393] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:border-[#e84393]/30'
                      }`}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {hasColors && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm">Color {selectedColor && <span className="text-[#e84393] font-normal">— {selectedColor}</span>}</h3>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color, i) => {
                    const isSelected = selectedColor === color.name;
                    const isInStock = color.quantity > 0;
                    return (
                      <button key={i} onClick={() => isInStock && setSelectedColor(selectedColor === color.name ? null : color.name)}
                        disabled={!isInStock}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected ? 'bg-[#e84393] text-white shadow-sm' : isInStock ? 'bg-white text-gray-700 border border-gray-200 hover:border-[#e84393]/30' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}>
                        {color.name}
                        {!isInStock && <span className="ml-1 text-xs">(Sold out)</span>}
                        {isInStock && !color.isOldFormat && color.quantity <= 3 && (
                          <span className={`ml-1 text-xs ${isSelected ? 'text-white/70' : 'text-amber-600'}`}>({color.quantity} left)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-5 border-t border-gray-100">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Quality Assured" },
                { icon: <Truck className="w-4 h-4" />, label: "Fast Shipping" },
                { icon: <ShoppingBag className="w-4 h-4" />, label: "Secure Checkout" },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-[#e84393]/8 flex items-center justify-center text-[#e84393]">{badge.icon}</div>
                  <p className="text-[10px] text-gray-500 font-medium">{badge.label}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              {/* Description */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-800 text-sm">Description</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDescription ? 'rotate-180' : ''}`} />
                </button>
                {showDescription && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{selectedProduct.description}</div>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setShowShipping(!showShipping)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-800 text-sm">Shipping Info</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showShipping ? 'rotate-180' : ''}`} />
                </button>
                {showShipping && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                    <ul className="text-gray-600 text-sm space-y-2">
                      {["Delivery days: Tuesday & Saturday", "Within Abeokuta: 24-48 hours", "Nationwide: 3-7 business days", "Tracking sent via email"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#e84393] rounded-full"></span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setShowReviews(!showReviews)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-800 text-sm">Reviews ({selectedProduct.reviews?.length || 0})</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showReviews ? 'rotate-180' : ''}`} />
                </button>
                {showReviews && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 max-h-96 overflow-y-auto">
                    {selectedProduct.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProduct.reviews.map((rev, i) => (
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
                      {errorMsg && <p className="text-red-500 text-xs mb-2">{errorMsg}</p>}
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <input type="text" placeholder="Your name" value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#e84393] focus:ring-1 focus:ring-[#e84393]/10 outline-none" />
                        <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#e84393] outline-none">
                          <option value={5}>5 Stars — Excellent</option>
                          <option value={4}>4 Stars — Very Good</option>
                          <option value={3}>3 Stars — Good</option>
                          <option value={2}>2 Stars — Fair</option>
                          <option value={1}>1 Star — Poor</option>
                        </select>
                        <textarea placeholder="Your review..." rows={3} value={reviewForm.comment}
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
            </div>
          </div>
        </div>
      </div>

      {/* YOU MIGHT ALSO LIKE */}
      {products && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
          <h3 className="text-2xl font-serif text-gray-900 mb-6">You Might Also Like</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {products
              .filter(p => p._id !== selectedProduct._id && p.visible !== false && p.category === selectedProduct.category)
              .slice(0, 6)
              .concat(
                products.filter(p => p._id !== selectedProduct._id && p.visible !== false && p.category !== selectedProduct.category).slice(0, 2)
              )
              .slice(0, 6)
              .map((p) => (
                <button key={p._id}
                  onClick={() => { setSelectedProduct(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-shrink-0 w-40 text-left group">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 mb-2 shadow-card group-hover:shadow-card-hover transition-shadow">
                    <img src={p.images?.[0] || p.image || '/placeholder.png'} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-[#e84393] transition-colors">{p.name}</p>
                  <p className="text-xs font-bold text-[#e84393]">₦{(p.salesPrice && p.salesPrice < p.price ? p.salesPrice : p.price).toLocaleString()}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* STICKY ADD TO CART */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-luxury-lg z-[900] px-4 py-3 safe-area-bottom">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            {selectedProduct.salesPrice && selectedProduct.salesPrice < selectedProduct.price && !hasPriceVariations ? (
              <>
                <p className="text-xs text-gray-400 line-through">₦{selectedProduct.price.toLocaleString()}</p>
                <p className="text-xl font-bold text-red-600">₦{selectedProduct.salesPrice.toLocaleString()}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400">Total Price</p>
                <p className="text-xl font-bold text-gray-900">₦{getDisplayPrice().toLocaleString()}</p>
                {hasPriceVariations && selectedVariation && selectedVariation.pieces > 1 && (
                  <p className="text-[10px] text-gray-500">{selectedVariation.pieces} pieces</p>
                )}
              </>
            )}
          </div>
          {isHidden || isOutOfStock ? (
            <button disabled className="flex-1 bg-gray-200 text-gray-400 py-4 rounded-xl font-semibold text-center cursor-not-allowed">
              {isHidden ? 'Unavailable' : 'Out of Stock'}
            </button>
          ) : (
            <button onClick={handleAddToCart}
              disabled={hasColors && selectedColor && !isSelectedColorInStock()}
              className={`flex-1 py-4 rounded-xl font-bold text-center shadow-md active:scale-[0.98] transition-all ${
                hasColors && selectedColor && !isSelectedColorInStock()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white hover:from-[#d63384] hover:to-[#9333ea] shadow-[#e84393]/20 hover:shadow-lg'
              }`}>
              {addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Added!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Add to Cart
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* LIGHTBOX */}
      {showLightbox && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {allImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-white/10 text-white px-3 py-1.5 rounded-full text-sm">{lightboxIndex + 1} / {allImages.length}</div>
          )}
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[lightboxIndex]} alt={`${selectedProduct.name} - ${lightboxIndex + 1}`} className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

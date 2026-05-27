import { useState, useEffect } from 'react';
import { X, ShoppingBag, ChevronLeft, ChevronRight, Star, Heart, ExternalLink } from 'lucide-react';

const QuickViewModal = ({ product, onClose, addToCart, setCurrentPage, setSelectedProduct, isWishlisted, toggleWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [product]);

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : product.image ? [product.image] : ['/placeholder.png'];
  const wishlisted = isWishlisted ? isWishlisted(product._id) : false;
  const hasOptions = (product.sizes?.length > 0) || (product.colors?.length > 0) || (product.priceVariations?.length > 0);
  const isOutOfStock = typeof product.quantity === 'number' && product.quantity <= 0;

  const handleAddToCart = () => {
    if (hasOptions) { setSelectedProduct(product); setCurrentPage('product'); onClose(); return; }
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleViewFull = () => { setSelectedProduct(product); setCurrentPage('product'); onClose(); };
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextImage() : prevImage(); }
    setTouchStart(null);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-luxury-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm transition-all hover:scale-110">
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* IMAGE SECTION with swipe */}
          <div className="relative bg-gray-50 aspect-square md:aspect-auto md:h-full overflow-hidden"
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-white transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentImageIndex ? 'bg-[#e84393] w-5' : 'bg-white/60'
                      }`} />
                  ))}
                </div>
              </>
            )}

            {/* Wishlist */}
            {toggleWishlist && (
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                  wishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'
                }`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="p-6 md:p-8 flex flex-col">
            {product.category && (
              <span className="text-[10px] text-[#e84393] font-semibold uppercase tracking-wider mb-2">{product.category}</span>
            )}

            <h2 className="text-2xl font-serif text-gray-900 mb-3 leading-tight">{product.name}</h2>

            {/* Rating */}
            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${
                      i < Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length)
                        ? 'text-amber-400 fill-current' : 'text-gray-200'
                    }`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({product.reviews.length})</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              {product.salesPrice && product.salesPrice < product.price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-600">₦{product.salesPrice.toLocaleString()}</span>
                  <span className="text-base text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    -{Math.round(((product.price - product.salesPrice) / product.price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{product.description}</p>

            {hasOptions && (
              <p className="text-xs text-[#e84393] font-medium mb-4 bg-[#e84393]/5 px-3 py-2 rounded-lg">
                This product has options — tap below to customize
              </p>
            )}

            {/* Spacer */}
            <div className="mt-auto space-y-3">
              {isOutOfStock ? (
                <button disabled className="w-full bg-gray-100 text-gray-400 py-3.5 rounded-xl font-semibold cursor-not-allowed">
                  Out of Stock
                </button>
              ) : (
                <button onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 magnetic-btn ${
                    addedToCart
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white hover:from-[#d63384] hover:to-[#9333ea] shadow-md hover:shadow-lg'
                  }`}>
                  {addedToCart ? (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Added!</>
                  ) : hasOptions ? (
                    <>Select Options</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" /> Add to Cart</>
                  )}
                </button>
              )}

              <button onClick={handleViewFull}
                className="w-full py-3 rounded-xl font-medium text-gray-600 border border-gray-200 hover:border-[#e84393]/30 hover:text-[#e84393] transition-all flex items-center justify-center gap-2 text-sm">
                View Full Details <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

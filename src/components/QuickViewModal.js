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
    <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Scrollable centering wrapper — this is the key pattern */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal card */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeInUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm">
            <X className="w-4 h-4" />
          </button>

          {/* IMAGE */}
          <div className="relative bg-gray-100 h-64 sm:h-72 overflow-hidden"
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img src={images[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />

            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-4 bg-[#e84393]' : 'w-1.5 bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}

            {toggleWishlist && (
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400'}`}>
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* INFO */}
          <div className="p-5">
            {product.category && (
              <span className="text-[10px] text-[#e84393] font-semibold uppercase tracking-wider mb-1 block">{product.category}</span>
            )}
            <h2 className="text-lg font-serif text-gray-900 mb-2 leading-snug">{product.name}</h2>

            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({product.reviews.length})</span>
              </div>
            )}

            <div className="mb-3">
              {product.salesPrice && product.salesPrice < product.price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-red-600">₦{product.salesPrice.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>

            <div className="space-y-2">
              {isOutOfStock ? (
                <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed text-sm">Out of Stock</button>
              ) : (
                <button onClick={handleAddToCart}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    addedToCart ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white shadow-md'
                  }`}>
                  {addedToCart ? 'Added!' : hasOptions ? 'Select Options' : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
                </button>
              )}
              <button onClick={handleViewFull}
                className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-[#e84393] transition-colors flex items-center justify-center gap-1.5">
                View Full Details <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

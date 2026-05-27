import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, ShoppingCart, X, ArrowLeft, CheckCircle, Mail, Package, Home, ShoppingBag, Heart } from "lucide-react";
import { paymentsAPI } from "../api";

const PRODUCTS_PER_PAGE = 20;

// Product Tag Component
const ProductTag = ({ tag }) => {
  const tagStyles = {
    'best-seller': { bg: 'bg-amber-500', icon: '👑', label: 'Best Seller' },
    'hot': { bg: 'bg-rose-500', icon: '🔥', label: 'Hot' },
    'new': { bg: 'bg-emerald-500', icon: '✨', label: 'New' },
    'recommended': { bg: 'bg-[#8B5E83]', icon: '💎', label: 'Recommended' },
    'limited': { bg: 'bg-gray-800', icon: '⏰', label: 'Limited' },
    'trending': { bg: 'bg-rose-400', icon: '📈', label: 'Trending' },
    'sale': { bg: 'bg-red-500', icon: '🏷️', label: 'Sale' },
    'popular': { bg: 'bg-blue-500', icon: '⭐', label: 'Popular' }
  };
  const style = tagStyles[tag] || tagStyles['new'];
  return (
    <div className={`${style.bg} text-white px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm flex items-center gap-1`}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </div>
  );
};

const ShopPage = ({
  products, cart, addToCart, updateQuantity, removeFromCart,
  searchQuery, setSearchQuery, setCurrentPage, setSelectedProduct,
  wishlist, toggleWishlist, isWishlisted, recentlyViewed
}) => {
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const userChangedFilters = useRef(false);
  const isInitialLoad = useRef(true);

  // Handle payment return
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get("reference") || urlParams.get("trxref");
      if (!reference) return;
      try {
        const response = await paymentsAPI.verifyPayment(reference);
        if (response.success) {
          localStorage.removeItem("cart");
          setPaymentData(response.data);
          setShowPaymentSuccess(true);
          window.history.replaceState({}, "", "/shop");
        } else {
          alert("Payment verification failed. If you were charged, please contact support.");
          window.history.replaceState({}, "", "/shop");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        alert("Could not verify payment. Please contact support if you were charged.");
        window.history.replaceState({}, "", "/shop");
      }
    };
    handlePaymentReturn();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [addedToCartAnimation, setAddedToCartAnimation] = useState(null);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.shopPage) {
        setCurrentPageNumber(event.state.shopPage);
        if (event.state.category) setSelectedCategory(event.state.category);
        if (event.state.sort) setSortOption(event.state.sort);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const savedSearch = localStorage.getItem("shopSearch") || "";
    const savedCategory = localStorage.getItem("shopCategory") || "all";
    const savedPage = localStorage.getItem("shopPage");
    const savedSort = localStorage.getItem("shopSort") || "latest";
    setSearchQuery(savedSearch);
    setSelectedCategory(savedCategory);
    setSortOption(savedSort);
    if (savedPage) setCurrentPageNumber(Number(savedPage));
    const returningFromProduct = localStorage.getItem("cameFromShop") === "true";
    if (!returningFromProduct) window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.removeItem("cameFromShop");
    const initialPage = savedPage ? Number(savedPage) : 1;
    window.history.replaceState({ shopPage: initialPage, category: savedCategory, sort: savedSort }, "", window.location.pathname);
    isInitialLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem("shopSearch", searchQuery); }, [searchQuery]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPageNumber(1);
    localStorage.setItem("shopCategory", cat);
    localStorage.setItem("shopPage", "1");
    window.history.pushState({ shopPage: 1, category: cat, sort: sortOption }, "", window.location.pathname);
  };

  const handleSortChange = (sort) => {
    setSortOption(sort);
    setCurrentPageNumber(1);
    localStorage.setItem("shopSort", sort);
    localStorage.setItem("shopPage", "1");
    window.history.pushState({ shopPage: 1, category: selectedCategory, sort: sort }, "", window.location.pathname);
  };

  useEffect(() => { localStorage.setItem("shopPage", currentPageNumber.toString()); }, [currentPageNumber]);

  useEffect(() => {
    if (userChangedFilters.current && !isInitialLoad.current) {
      setCurrentPageNumber(1);
      localStorage.setItem("shopPage", "1");
    }
    userChangedFilters.current = true;
  }, [searchQuery]);

  const visibleProducts = useMemo(() => products.filter((p) => p.visible !== false), [products]);

  const dynamicCategories = useMemo(() => {
    const set = new Set();
    visibleProducts.forEach((p) => { if (p.category) set.add(p.category.toLowerCase().trim()); });
    const arr = Array.from(set);
    arr.sort();
    return ["all", ...arr];
  }, [visibleProducts]);

  const processedProducts = useMemo(() => {
    let list = [...visibleProducts];
    if (selectedCategory !== "all") {
      list = list.filter((p) => (p.category || "").toLowerCase().trim() === selectedCategory.toLowerCase().trim());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        return p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          (p.searchCategories || []).some((cat) => cat.toLowerCase().includes(q)) ||
          p.description?.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q);
      });
    }
    list.sort((a, b) => {
      if (sortOption === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortOption === "price-desc") return (b.price || 0) - (a.price || 0);
      const aOrder = typeof a.displayOrder === 'number' ? a.displayOrder : 99999;
      const bOrder = typeof b.displayOrder === 'number' ? b.displayOrder : 99999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
    return list;
  }, [visibleProducts, selectedCategory, searchQuery, sortOption]);

  const totalPages = Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE) || 1;
  const startIndex = (currentPageNumber - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = processedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const isInCart = (id) => cart.some((item) => item._id === id);

  const handleOpenProduct = (product) => {
    localStorage.setItem("cameFromShop", "true");
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  const handlePageChange = useCallback((page) => {
    setCurrentPageNumber(page);
    localStorage.setItem("shopPage", page.toString());
    window.history.pushState({ shopPage: page, category: selectedCategory, sort: sortOption }, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, sortOption]);

  const hasActiveFilter = selectedCategory !== "all" || searchQuery.trim() !== "" || sortOption !== "latest";

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("latest");
    setCurrentPageNumber(1);
    localStorage.setItem("shopCategory", "all");
    localStorage.setItem("shopSearch", "");
    localStorage.setItem("shopSort", "latest");
    localStorage.setItem("shopPage", "1");
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToCartAnimation(product._id);
    setTimeout(() => setAddedToCartAnimation(null), 1000);
  };

  const handleRemoveFromCart = (productId, e) => {
    e.stopPropagation();
    removeFromCart(productId);
  };

  const handleCloseSuccessModal = () => {
    setShowPaymentSuccess(false);
    setPaymentData(null);
    window.location.reload();
  };

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPageNumber <= 3) { pages.push(2, 3, 4, '...', totalPages); }
      else if (currentPageNumber >= totalPages - 2) { pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
      else { pages.push('...', currentPageNumber - 1, currentPageNumber, currentPageNumber + 1, '...', totalPages); }
    }
    return pages;
  };

  return (
    <div id="shop-top" className="min-h-screen bg-[#fffbf7] pt-0 pb-16 -mt-10">
      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-32 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseSuccessModal}></div>
          <div className="relative bg-white rounded-3xl shadow-luxury-xl max-w-md w-full overflow-hidden animate-fadeInUp">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-emerald-100">Thank you for your order</p>
            </div>
            <div className="px-8 py-6">
              {paymentData && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500 text-sm">Reference</span>
                    <span className="font-semibold text-gray-800 text-sm">{paymentData.reference || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Amount Paid</span>
                    <span className="font-bold text-emerald-600 text-lg">₦{((paymentData.amount || 0) / 100).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
                <Mail className="w-5 h-5 text-[#8B5E83] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Check Your Email</p>
                  <p className="text-gray-500 text-xs mt-1">A confirmation email with your order details has been sent.</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-[#8B5E83]" /> What Happens Next?
                </h3>
                <div className="space-y-2">
                  {["We're preparing your order", "You'll receive tracking info via email", "Delivery within 3-7 business days"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#8B5E83] rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                      <p className="text-gray-600 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowPaymentSuccess(false); setCurrentPage("home"); window.location.reload(); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-sm">
                  <Home className="w-4 h-4" /> Home
                </button>
                <button onClick={handleCloseSuccessModal}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#8B5E83] rounded-xl text-white font-semibold hover:bg-[#7a5073] transition text-sm">
                  <ShoppingBag className="w-4 h-4" /> Shop More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* BACK BUTTON */}
        <button onClick={() => setCurrentPage("home")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-[#8B5E83] transition-colors mb-4 text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>

        {/* SEARCH + SORT */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text" placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { userChangedFilters.current = true; setSelectedCategory("all"); setSearchQuery(e.target.value); }}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 bg-white
                  focus:outline-none focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10
                  transition-all duration-300 text-gray-700 placeholder-gray-400"
                style={{ fontSize: '16px' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none border border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-3 pr-10
                focus:outline-none focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10
                transition-all duration-300 cursor-pointer text-sm font-medium">
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {hasActiveFilter && (
              <button onClick={handleClearFilters} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#8B5E83] transition font-medium">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="relative mb-10">
          <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide">
            {dynamicCategories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-full capitalize text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-[#8B5E83] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-[#8B5E83]/30"
                }`}>
                {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            {hasActiveFilter && (
              <button onClick={handleClearFilters} className="px-6 py-3 bg-[#8B5E83] text-white rounded-xl hover:bg-[#7a5073] transition text-sm font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Product count */}
            <p className="text-sm text-gray-400 mb-6">{processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-12">
              {currentProducts.map((product, index) => {
                const inCart = isInCart(product._id);
                const stock = typeof product.quantity === "number" ? product.quantity : product.inStock === false ? 0 : 999999;
                const isOutOfStock = stock <= 0;
                const hasOptions = (Array.isArray(product.sizes) && product.sizes.length > 0) ||
                  (Array.isArray(product.colors) && product.colors.length > 0) ||
                  (Array.isArray(product.priceVariations) && product.priceVariations.length > 0);
                const isAnimating = addedToCartAnimation === product._id;
                const wishlisted = isWishlisted && isWishlisted(product._id);
                const lowStock = stock > 0 && stock <= 5;

                return (
                  <div key={product._id}
                    className="group bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover
                      transition-all duration-500 cursor-pointer flex flex-col h-full border border-gray-100
                      hover:border-[#8B5E83]/20"
                    onClick={() => handleOpenProduct(product)}>

                    {/* IMAGE */}
                    <div className="relative overflow-hidden bg-gray-50 h-48 sm:h-56">
                      <img src={product.images?.[0] || product.image || "/placeholder.png"} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />

                      {/* Tag */}
                      {product.tag && !isOutOfStock && (
                        <div className="absolute top-3 left-3 z-10"><ProductTag tag={product.tag} /></div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute top-3 left-3 bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      )}

                      {inCart && !isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          In Cart
                        </div>
                      )}

                      {/* Wishlist button */}
                      {toggleWishlist && (
                        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-sm"
                          style={{ display: inCart ? 'none' : undefined }}>
                          <Heart className={`w-4 h-4 ${wishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                        </button>
                      )}

                      {/* Stock urgency */}
                      {lowStock && !isOutOfStock && (
                        <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-semibold">
                          Only {stock} left
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full
                          transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-3.5 flex flex-col flex-1">
                      <span className="text-[10px] text-[#8B5E83] font-semibold uppercase tracking-wider mb-1">
                        {product.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B5E83] transition-colors">
                        {product.name}
                      </h3>

                      <div className="mt-auto space-y-2.5">
                        {/* Price */}
                        <div>
                          {product.salesPrice && product.salesPrice < product.price ? (
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-lg font-bold text-red-600">₦{product.salesPrice.toLocaleString()}</span>
                              <span className="text-sm text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                -{Math.round(((product.price - product.salesPrice) / product.price) * 100)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Button */}
                        {isOutOfStock ? (
                          <button disabled className="w-full bg-gray-100 text-gray-400 px-4 py-2.5 rounded-xl text-xs font-medium cursor-not-allowed">
                            Unavailable
                          </button>
                        ) : hasOptions ? (
                          <button onClick={(e) => { e.stopPropagation(); handleOpenProduct(product); }}
                            className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium
                              hover:bg-[#8B5E83] transition-colors duration-300 flex items-center justify-center gap-2">
                            Select Options
                          </button>
                        ) : inCart ? (
                          <button onClick={(e) => handleRemoveFromCart(product._id, e)}
                            className="w-full bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-medium
                              hover:bg-red-50 hover:text-red-600 transition-colors duration-300">
                            Remove
                          </button>
                        ) : (
                          <button onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium
                              hover:bg-[#8B5E83] transition-all duration-300 flex items-center justify-center gap-2
                              ${isAnimating ? 'bg-emerald-500 scale-95' : ''}`}>
                            {isAnimating ? (
                              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg> Added!</>
                            ) : (
                              <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-12">
                {currentPageNumber > 1 && (
                  <button onClick={() => handlePageChange(currentPageNumber - 1)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[#8B5E83] hover:text-[#8B5E83] transition text-sm">
                    ←
                  </button>
                )}
                {getPaginationNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400 text-sm">...</span>
                  ) : (
                    <button key={page} onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] h-[40px] rounded-xl font-medium text-sm transition-all duration-300 ${
                        page === currentPageNumber
                          ? "bg-[#8B5E83] text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-[#8B5E83] hover:text-[#8B5E83]"
                      }`}>
                      {page}
                    </button>
                  )
                ))}
                {currentPageNumber < totalPages && (
                  <button onClick={() => handlePageChange(currentPageNumber + 1)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[#8B5E83] hover:text-[#8B5E83] transition text-sm">
                    →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* RECENTLY VIEWED */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-100">
            <h3 className="text-xl font-serif text-gray-900 mb-6">Recently Viewed</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentlyViewed.slice(0, 6).map((product) => (
                <button key={product._id} onClick={() => handleOpenProduct(product)}
                  className="flex-shrink-0 w-36 text-left group">
                  <div className="w-36 h-36 rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img src={product.images?.[0] || product.image || "/placeholder.png"} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-[#8B5E83] transition-colors">{product.name}</p>
                  <p className="text-xs text-gray-500 font-semibold">₦{product.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

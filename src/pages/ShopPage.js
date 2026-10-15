import './ShopPage.css';
import { productPresentation, formatPrice } from '../productPresentation';
import { productPath } from '../productLinks';
import { cartLineKey } from '../cart';
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, ShoppingCart, X, ArrowLeft, CheckCircle, Mail, Package, Home, ShoppingBag, Heart, Eye } from "lucide-react";
import { paymentsAPI } from "../api";
import QuickViewModal from "../components/QuickViewModal";

const PRODUCTS_PER_PAGE = 20;

const ShopPage = ({
  products, cart, addToCart, updateQuantity, removeFromCart,
  searchQuery, setSearchQuery, setCurrentPage, setSelectedProduct,
  wishlist, toggleWishlist, isWishlisted, recentlyViewed, clearCart
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
          clearCart();
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
  }, [clearCart]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [addedToCartAnimation, setAddedToCartAnimation] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

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
      if (sortOption === "price-asc") return productPresentation(a).price - productPresentation(b).price;
      if (sortOption === "price-desc") return productPresentation(b).price - productPresentation(a).price;
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

  const handleOpenProduct = (product, event) => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    localStorage.setItem("cameFromShop", "true");
    setSelectedProduct(product);
    setCurrentPage(productPath(product).slice(1));
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
    if (addToCart(product) === false) return;
    setAddedToCartAnimation(product._id);
    setTimeout(() => setAddedToCartAnimation(null), 1000);
  };

  const handleRemoveFromCart = (productId, e) => {
    e.stopPropagation();
    removeFromCart(cartLineKey({ _id: productId }));
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
    <div id="shop-top" className="anjola-shop">
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
                <Mail className="w-5 h-5 text-[#e84393] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{paymentData?.needsReview ? 'Order Needs Review' : 'Payment Received'}</p>
                  <p className="text-gray-500 text-xs mt-1">{paymentData?.needsReview ? 'Your payment is recorded. Please contact us with your reference so we can confirm availability or arrange a refund. Do not pay again.' : 'Your payment is recorded. Keep your reference and check your inbox for order updates.'}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-[#e84393]" /> What Happens Next?
                </h3>
                <div className="space-y-2">
                  {(paymentData?.needsReview ? ["Contact support with your payment reference", "We will confirm fulfillment or refund options"] : ["We're preparing your order", "You'll receive tracking info via email", "Delivery within 3-7 business days"]).map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#e84393] rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#e84393] rounded-xl text-white font-semibold hover:bg-[#d63384] transition text-sm">
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
          className="flex items-center gap-1.5 text-gray-500 hover:text-[#e84393] transition-colors mb-4 text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>

        <div className="shop-heading"><p className="shop-eyebrow">THE ANJOLA COLLECTION</p><h1>Find your kind of lovely.</h1><p>Thoughtful gifts, everyday favourites, and a little something just for you.</p></div>
        <div className="shop-toolbar">
          <div className="shop-search"><label className="sr-only" htmlFor="shop-search">Search products</label><Search size={19} />
            <input id="shop-search" type="search" placeholder="Find a gift, a bag, a little joy…" value={searchQuery} onChange={e => { userChangedFilters.current = true; setSearchQuery(e.target.value); }} />
            {searchQuery && <button aria-label="Clear search" onClick={() => setSearchQuery('')}><X size={18} /></button>}
          </div>
          <div className="shop-category-select"><label htmlFor="shop-category">Collection</label><select id="shop-category" value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>{dynamicCategories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All products' : cat}</option>)}</select></div>
          <div className="shop-sort"><label htmlFor="shop-sort">Sort by</label><select id="shop-sort" value={sortOption} onChange={e => handleSortChange(e.target.value)}><option value="latest">Featured order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
        </div>
        <nav className="shop-category-links" aria-label="Product collections">{dynamicCategories.map(cat => <button key={cat} aria-pressed={selectedCategory === cat} onClick={() => handleCategoryChange(cat)}>{cat === 'all' ? 'All products' : cat}</button>)}</nav>
        <div className="shop-results-summary"><p role="status">{processedProducts.length} {processedProducts.length === 1 ? 'find' : 'finds'}{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ' to explore'}</p>{hasActiveFilter && <button onClick={handleClearFilters}>Reset filters <X size={14} /></button>}</div>

        {/* PRODUCTS */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            {hasActiveFilter && (
              <button onClick={handleClearFilters} className="px-6 py-3 bg-[#e84393] text-white rounded-xl hover:bg-[#d63384] transition text-sm font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="shop-product-grid">
              {currentProducts.map(product => {
                const { price, hasPacks, onSale, available, hasOptions } = productPresentation(product);
                const inCart = isInCart(product._id);
                const wishlisted = isWishlisted?.(product._id) || false;
                return <article key={product._id} className="shop-product-card" aria-label={product.name}>
                  <div className="shop-card-media">
                    <a className="shop-product-image" href={productPath(product)} onClick={event => handleOpenProduct(product, event)} aria-label={`View ${product.name}`}>
                      {product.images?.[0] || product.image ? <img src={product.images?.[0] || product.image} alt={product.name} loading="lazy" /> : <ShoppingBag size={40} />}
                    </a>
                    {(!available || onSale || product.tag) && <span className="shop-product-badge">{!available ? 'Sold out' : onSale ? 'On sale' : product.tag.replace(/-/g, ' ')}</span>}
                    {toggleWishlist && <button className="shop-wishlist" aria-label={`${wishlisted ? 'Remove' : 'Save'} ${product.name} ${wishlisted ? 'from' : 'to'} wishlist`} aria-pressed={wishlisted} onClick={() => toggleWishlist(product)}><Heart size={19} fill={wishlisted ? 'currentColor' : 'none'} /></button>}
                    <button className="shop-quickview" aria-label={`Quick view ${product.name}`} onClick={() => setQuickViewProduct(product)}><Eye size={15} />Quick view</button>
                  </div>
                  <div className="shop-card-copy">
                    <p className="shop-product-category">{product.category}</p>
                    <h2><a href={productPath(product)} onClick={event => handleOpenProduct(product, event)}>{product.name}</a></h2>
                    <p className="shop-price">{hasPacks && <span>From </span>}{formatPrice(price)}{onSale && <del>{formatPrice(product.price)}</del>}</p>
                    {hasPacks && <p className="shop-pack-note">Price per pack · options available</p>}
                    {inCart && <span className="shop-in-bag">In your bag</span>}
                    {!available ? <button disabled className="shop-card-action">Currently unavailable</button> : hasOptions ? <button className="shop-card-action" onClick={() => handleOpenProduct(product)}>Choose options <ShoppingBag size={16} /></button> : inCart ? <button className="shop-card-action shop-remove" onClick={e => handleRemoveFromCart(product._id, e)}>Remove from bag <X size={15} /></button> : <button className="shop-card-action" onClick={e => handleAddToCart(product, e)}>{addedToCartAnimation === product._id ? 'Added to bag' : 'Add to bag'} <ShoppingCart size={16} /></button>}
                  </div>
                </article>;
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-12">
                {currentPageNumber > 1 && (
                  <button aria-label="Previous page" onClick={() => handlePageChange(currentPageNumber - 1)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[#e84393] hover:text-[#e84393] transition text-sm">
                    ←
                  </button>
                )}
                {getPaginationNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400 text-sm">...</span>
                  ) : (
                    <button key={page} aria-label={`Page ${page}`} aria-current={page === currentPageNumber ? 'page' : undefined} onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] h-[40px] rounded-xl font-medium text-sm transition-all duration-300 ${
                        page === currentPageNumber
                          ? "bg-[#e84393] text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-[#e84393] hover:text-[#e84393]"
                      }`}>
                      {page}
                    </button>
                  )
                ))}
                {currentPageNumber < totalPages && (
                  <button aria-label="Next page" onClick={() => handlePageChange(currentPageNumber + 1)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[#e84393] hover:text-[#e84393] transition text-sm">
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
              {recentlyViewed.map(item => visibleProducts.find(p => p._id === item._id)).filter(Boolean).slice(0, 6).map((product) => (
                <a key={product._id} href={productPath(product)} onClick={event => handleOpenProduct(product, event)}
                  className="flex-shrink-0 w-36 text-left group">
                  <div className="w-36 h-36 rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img src={product.images?.[0] || product.image || "/placeholder.png"} alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-[#e84393] transition-colors">{product.name}</p>
                  <p className="text-xs text-gray-500 font-semibold">{productPresentation(product).hasPacks ? 'From ' : ''}{formatPrice(productPresentation(product).price)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          addToCart={addToCart}
          setCurrentPage={setCurrentPage}
          setSelectedProduct={setSelectedProduct}
          isWishlisted={isWishlisted}
          toggleWishlist={toggleWishlist}
        />
      )}
    </div>
  );
};

export default ShopPage;

import './ShopPage.css';
import { productPresentation, formatPrice } from '../productPresentation';
import { productPath } from '../productLinks';
import { cartLineKey } from '../cart';
import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { Search, ShoppingCart, X, ArrowLeft, ShoppingBag, Heart, Eye } from "lucide-react";
import QuickViewModal from "../components/QuickViewModal";

const PRODUCTS_PER_PAGE = 20;

const ShopPage = ({
  products, cart, addToCart, updateQuantity, removeFromCart,
  searchQuery, setSearchQuery, setCurrentPage, setSelectedProduct,
  wishlist, toggleWishlist, isWishlisted, recentlyViewed
}) => {
  const userChangedFilters = useRef(false);
  const isInitialLoad = useRef(true);
  const [returnPosition] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('shopReturnPosition')); }
    catch { return null; }
  });
  const restoredPosition = useRef(false);
  const initialSearch = useRef(localStorage.getItem('shopSearch') || '');

  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem("shopCategory") || "all");
  const [currentPageNumber, setCurrentPageNumber] = useState(() => Number(localStorage.getItem("shopPage")) || 1);
  const [sortOption, setSortOption] = useState(() => localStorage.getItem("shopSort") || "latest");
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
    if (!returningFromProduct && !returnPosition) window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.removeItem("cameFromShop");
    const initialPage = savedPage ? Number(savedPage) : 1;
    window.history.replaceState({ ...window.history.state, shopPage: initialPage, category: savedCategory, sort: savedSort }, "", window.location.pathname);
    isInitialLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem("shopSearch", searchQuery); }, [searchQuery]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPageNumber(1);
    localStorage.setItem("shopCategory", cat);
    localStorage.setItem("shopPage", "1");
    window.history.pushState({ ...window.history.state, shopPage: 1, category: cat, sort: sortOption }, "", window.location.pathname);
  };

  const handleSortChange = (sort) => {
    setSortOption(sort);
    setCurrentPageNumber(1);
    localStorage.setItem("shopSort", sort);
    localStorage.setItem("shopPage", "1");
    window.history.pushState({ ...window.history.state, shopPage: 1, category: selectedCategory, sort: sort }, "", window.location.pathname);
  };

  useEffect(() => { localStorage.setItem("shopPage", currentPageNumber.toString()); }, [currentPageNumber]);

  useEffect(() => {
    if (userChangedFilters.current && !isInitialLoad.current) {
      setCurrentPageNumber(1);
      localStorage.setItem("shopPage", "1");
    }
    userChangedFilters.current = false;
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

  useLayoutEffect(() => {
    if (!returnPosition || restoredPosition.current || !products.length) return;
    if (searchQuery !== initialSearch.current) return;
    const card = Array.from(document.querySelectorAll('[data-shop-product]'))
      .find(element => element.dataset.shopProduct === returnPosition.productId);
    const top = card && Number.isFinite(returnPosition.cardOffset)
      ? window.scrollY + card.getBoundingClientRect().top - returnPosition.cardOffset
      : returnPosition.scrollY;
    if (Number.isFinite(top)) window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    restoredPosition.current = true;
    sessionStorage.removeItem('shopReturnPosition');
  }, [returnPosition, products, searchQuery, currentPageNumber, selectedCategory, sortOption]);

  const rememberPosition = (product) => {
    const card = Array.from(document.querySelectorAll('[data-shop-product]'))
      .find(element => element.dataset.shopProduct === product._id);
    sessionStorage.setItem('shopReturnPosition', JSON.stringify({
      productId: product._id, scrollY: window.scrollY,
      cardOffset: card ? card.getBoundingClientRect().top : null
    }));
  };

  const handleOpenProduct = (product, event) => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    rememberPosition(product);
    localStorage.setItem("cameFromShop", "true");
    setSelectedProduct(product);
    setCurrentPage(productPath(product).slice(1));
  };

  const handlePageChange = useCallback((page) => {
    setCurrentPageNumber(page);
    localStorage.setItem("shopPage", page.toString());
    window.history.pushState({ ...window.history.state, shopPage: page, category: selectedCategory, sort: sortOption }, "", window.location.pathname);
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
                return <article key={product._id} data-shop-product={product._id} className="shop-product-card" aria-label={product.name}>
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
          setCurrentPage={page => { rememberPosition(quickViewProduct); setCurrentPage(page); }}
          setSelectedProduct={setSelectedProduct}
          isWishlisted={isWishlisted}
          toggleWishlist={toggleWishlist}
        />
      )}
    </div>
  );
};

export default ShopPage;

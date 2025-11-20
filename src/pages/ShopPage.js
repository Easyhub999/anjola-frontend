// ================= SHOPPAGE.JS — ORIGINAL COLORS + LUXURY FEATURES =================

import React, { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

const PRODUCTS_PER_PAGE = 20;

const ShopPage = ({
  products,
  cart,
  addToCart,
  updateQuantity,
  removeFromCart,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  setSelectedProduct,
}) => {
  // Scroll to top on first load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [addedToCartAnimation, setAddedToCartAnimation] = useState(null);

  // =====================================================
  // 🔥 RESTORE SAVED FILTERS (RUNS ONCE)
  // =====================================================
  useEffect(() => {
    const savedSearch = localStorage.getItem("shopSearch");
    const savedCategory = localStorage.getItem("shopCategory");
    const savedPage = localStorage.getItem("shopPage");
    const savedSort = localStorage.getItem("shopSort");

    if (savedSearch) setSearchQuery(savedSearch);
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedPage) setCurrentPageNumber(Number(savedPage));
    if (savedSort) setSortOption(savedSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // 🔥 SAVE FILTERS TO LOCALSTORAGE
  // =====================================================
  useEffect(() => {
    localStorage.setItem("shopSearch", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem("shopCategory", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("shopPage", currentPageNumber);
  }, [currentPageNumber]);

  useEffect(() => {
    localStorage.setItem("shopSort", sortOption);
  }, [sortOption]);

  // =====================================================
  // BASE PRODUCTS: only visible ones
  // =====================================================
  const visibleProducts = useMemo(
    () => products.filter((p) => p.visible !== false),
    [products]
  );

  // =====================================================
  // DYNAMIC CATEGORIES (AUTO-SORTED)
  // =====================================================
  const dynamicCategories = useMemo(() => {
    const set = new Set();
    visibleProducts.forEach((p) => {
      if (p.category) {
        set.add(p.category.toLowerCase().trim());
      }
    });
    const arr = Array.from(set);
    arr.sort();
    return ["all", ...arr];
  }, [visibleProducts]);

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================
  const processedProducts = useMemo(() => {
    let list = [...visibleProducts];

    // CATEGORY FILTER
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          (p.category || "").toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim()
      );
    }

    // SEARCH FILTER
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q)
      );
    }

    // SORT
    list.sort((a, b) => {
      if (sortOption === "price-asc") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortOption === "price-desc") {
        return (b.price || 0) - (a.price || 0);
      }
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    return list;
  }, [visibleProducts, selectedCategory, searchQuery, sortOption]);

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [selectedCategory, searchQuery, sortOption]);

  const totalPages =
    Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE) || 1;

  const startIndex = (currentPageNumber - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = processedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // Check if item is in cart
  const isInCart = (id) => {
    return cart.some((item) => item._id === id);
  };

  // OPEN PRODUCT PAGE
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  // PAGINATION CLICK → scroll back to top
  const handlePageChange = (page) => {
    setCurrentPageNumber(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CLEAR FILTERS
  const hasActiveFilter =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortOption !== "latest";

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("latest");
    setCurrentPageNumber(1);
  };

  // Add to cart with animation
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToCartAnimation(product._id);
    setTimeout(() => setAddedToCartAnimation(null), 1000);
  };

  // Remove from cart
  const handleRemoveFromCart = (productId, e) => {
    e.stopPropagation();
    removeFromCart(productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20 pb-16">
      {/* Decorative Background Elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none animate-float-gentle"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none animate-float-gentle" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* HEADER - Enhanced */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl sm:text-6xl font-serif text-gray-900 mb-4 tracking-tight">
            Our Collection
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-light">
            Curated luxury self-care and aesthetic pieces, selected with love
          </p>
          
          {/* Results count */}
          <p className="text-sm text-gray-500 mt-3">
            {processedProducts.length} {processedProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* SEARCH + SORT + CLEAR - Enhanced */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-slideInUp">
          {/* SEARCH - NO ZOOM FIX */}
          <div className="w-full md:max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-pink-500 transition pointer-events-none" />
              <input
                type="text"
                placeholder="Search luxury products..."
                value={searchQuery}
                onChange={(e) => {
                  setSelectedCategory("all");
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 
                  bg-white focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100
                  transition-all duration-300 text-gray-700 placeholder-gray-400 text-base"
                style={{ fontSize: '16px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* SORT + CLEAR */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none border-2 border-gray-200 bg-white text-gray-700 
                  rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-pink-400 
                  focus:ring-4 focus:ring-pink-100 transition-all duration-300 cursor-pointer
                  text-sm font-medium"
              >
                <option value="latest">✨ Latest Arrivals</option>
                <option value="price-asc">💰 Price: Low → High</option>
                <option value="price-desc">💎 Price: High → Low</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 
                  transition-colors duration-300 font-medium"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CATEGORIES - Enhanced Scrollable Pills */}
        <div className="relative mb-12 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-6 py-3 rounded-full capitalize text-sm font-semibold 
                  whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-pink-400 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-pink-50 hover:shadow-md border-2 border-gray-200 hover:border-pink-300"
                }`}
              >
                {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-2xl font-serif text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {currentProducts.map((product, index) => {
                const inCart = isInCart(product._id);

                const stock =
                  typeof product.quantity === "number"
                    ? product.quantity
                    : product.inStock === false
                    ? 0
                    : 999999;

                const isOutOfStock = stock <= 0;
                const hasOptions =
                  (Array.isArray(product.sizes) && product.sizes.length > 0) ||
                  (Array.isArray(product.colors) && product.colors.length > 0);

                const isAnimating = addedToCartAnimation === product._id;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-xl shadow-md overflow-hidden 
                      hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 
                      cursor-pointer flex flex-col h-full border border-gray-100 hover:border-pink-200
                      animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleOpenProduct(product)}
                  >
                    {/* IMAGE CONTAINER */}
                    <div className="relative overflow-hidden aspect-square bg-gray-50">
                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* OUT OF STOCK BADGE */}
                      {isOutOfStock && (
                        <div className="absolute top-3 left-3 bg-pink-200/90 backdrop-blur-sm text-pink-700 
                          px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                          Out of Stock
                        </div>
                      )}

                      {/* IN CART INDICATOR */}
                      {inCart && !isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-green-100/90 backdrop-blur-sm text-green-700 
                          px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          In Cart
                        </div>
                      )}

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white text-xs font-medium">Click to view details</span>
                      </div>
                    </div>

                    {/* CONTENT - COMPACT */}
                    <div className="p-3 flex flex-col flex-1">
                      {/* Category Badge */}
                      <span className="inline-block text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1.5">
                        {product.category}
                      </span>

                      {/* Product Name */}
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 line-clamp-2 
                        group-hover:text-pink-600 transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      {/* PRICE + ACTION BUTTONS */}
                      <div className="mt-auto space-y-2.5">
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-bold text-pink-600">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="w-full">
                          {isOutOfStock ? (
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              disabled
                              className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-lg 
                                text-xs font-semibold cursor-not-allowed"
                            >
                              Unavailable
                            </button>
                          ) : hasOptions ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProduct(product);
                              }}
                              className="w-full bg-pink-400 text-white px-4 py-2 rounded-full 
                                text-xs font-semibold hover:bg-pink-500 hover:shadow-lg
                                transition-all duration-300"
                            >
                              Select Options
                            </button>
                          ) : inCart ? (
                            <button
                              onClick={(e) => handleRemoveFromCart(product._id, e)}
                              className="w-full bg-red-400 text-white px-4 py-2 rounded-lg 
                                text-xs font-semibold hover:bg-red-500 hover:shadow-lg
                                transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className={`w-full bg-pink-400 text-white px-4 py-2 rounded-lg 
                                text-xs font-semibold hover:bg-pink-500 hover:shadow-lg
                                transition-all duration-300 flex items-center justify-center gap-2
                                ${isAnimating ? 'animate-pulse' : ''}`}
                            >
                              {isAnimating ? (
                                <>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Added!
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                  Add to Cart
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION - Enhanced */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 animate-fadeIn">
                {/* Back to First */}
                {currentPageNumber > 1 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 
                      hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 
                      font-medium text-sm"
                  >
                    ← First
                  </button>
                )}

                {/* Page Numbers */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPageNumber <= 3) {
                      page = i + 1;
                    } else if (currentPageNumber >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPageNumber - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] px-4 py-2.5 rounded-xl font-semibold text-sm 
                          transition-all duration-300 ${
                          page === currentPageNumber
                            ? "bg-pink-400 text-white shadow-lg scale-110"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next */}
                {currentPageNumber < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPageNumber + 1)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 
                      hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 
                      font-medium text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ANIMATIONS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(-5px) translateX(-5px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .animate-float-gentle {
          animation: float-gentle 10s ease-in-out infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
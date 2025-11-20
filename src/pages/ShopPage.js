// ================= SHOPPAGE.JS — CLIENT'S PREFERRED COLORS + NEW FEATURES =================

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <h1 className="text-5xl font-serif text-center mb-4 text-gray-800">
          Our Collection
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm md:text-base">
          Curated self-care and aesthetics pieces, selected with love.
        </p>

        {/* SEARCH + SORT + CLEAR FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* SEARCH */}
          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSelectedCategory("all");
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 
                  bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* SORT + CLEAR */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-200 bg-white text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>

            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="text-xs md:text-sm text-gray-600 hover:text-pink-500 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* CATEGORIES — SCROLLABLE ON MOBILE */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full capitalize text-sm md:text-base whitespace-nowrap transition
                ${
                  selectedCategory === cat
                    ? "bg-pink-400 text-white shadow"
                    : "bg-white text-gray-700 hover:bg-pink-100"
                }`}
            >
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {currentProducts.map((product) => {
                const inCart = isInCart(product._id);

                const stock =
                  typeof product.quantity === "number"
                    ? product.quantity
                    : product.inStock === false
                    ? 0
                    : 999999;

                const isOutOfStock = stock <= 0;
                const hasOptions =
                  (Array.isArray(product.sizes) &&
                    product.sizes.length > 0) ||
                  (Array.isArray(product.colors) &&
                    product.colors.length > 0);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden 
                      hover:scale-[1.02] hover:shadow-xl transition 
                      cursor-pointer flex flex-col h-full"
                    onClick={() => handleOpenProduct(product)}
                  >
                    {/* IMAGE + BADGES */}
                    <div className="relative">
                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />

                      {isOutOfStock && (
                        <span className="absolute top-2 right-2 bg-pink-200 text-pink-700 
                          text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          Out of Stock
                        </span>
                      )}

                      {inCart && !isOutOfStock && (
                        <span className="absolute top-2 left-2 bg-green-100 text-green-700 
                          text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          In Cart ✓
                        </span>
                      )}
                    </div>

                    {/* CONTENT - COMPACT SPACING */}
                    <div className="p-3 flex flex-col flex-1">
                      <span className="text-xs text-purple-600 uppercase tracking-wide mb-1">
                        {product.category}
                      </span>

                      <h3 className="text-sm md:text-base font-semibold mb-2 text-gray-800 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* PRICE + CART / OPTIONS */}
                      <div className="mt-auto flex justify-between items-center gap-2">
                        <span className="text-lg md:text-xl font-bold text-pink-600">
                          ₦{product.price.toLocaleString()}
                        </span>

                        {/* BUTTON AREA */}
                        {isOutOfStock ? (
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            disabled
                            className="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg 
                              text-xs cursor-not-allowed"
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
                            className="bg-pink-400 text-white px-3 py-1.5 rounded-full 
                              text-xs hover:bg-pink-500 transition font-medium"
                          >
                            Select Options
                          </button>
                        ) : inCart ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product._id);
                            }}
                            className="bg-red-400 text-white px-3 py-1.5 rounded-lg 
                              text-xs hover:bg-red-500 transition font-medium"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="bg-pink-400 text-white px-4 py-1.5 rounded-lg 
                              text-xs hover:bg-pink-500 transition font-medium"
                          >
                            Add
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
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => {
                    setCurrentPageNumber(1);
                    window.scrollTo(0, 0);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  ← Back to first page
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg border text-sm ${
                          page === currentPageNumber
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-pink-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
// ================= SHOPPAGE.JS — CLEAN LUXURY VERSION =================

import React, { useState, useEffect, useMemo } from "react";
import { Search, ShoppingCart, X, ArrowLeft } from "lucide-react";

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
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortOption, setSortOption] = useState("latest");
  const [addedToCartAnimation, setAddedToCartAnimation] = useState(null);

  // Restore saved filters
  useEffect(() => {
    const savedSearch = localStorage.getItem("shopSearch");
    const savedCategory = localStorage.getItem("shopCategory");
    const savedPage = localStorage.getItem("shopPage");
    const savedSort = localStorage.getItem("shopSort");

    if (savedSearch) setSearchQuery(savedSearch);
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedPage) setCurrentPageNumber(Number(savedPage));
    if (savedSort) setSortOption(savedSort);
  }, []);

  // Save filters
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

  const visibleProducts = useMemo(
    () => products.filter((p) => p.visible !== false),
    [products]
  );

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

  const processedProducts = useMemo(() => {
    let list = [...visibleProducts];

    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          (p.category || "").toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;

      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    return list;
  }, [visibleProducts, selectedCategory, searchQuery, sortOption]);

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

  const isInCart = (id) => cart.some((item) => item._id === id);

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  const handlePageChange = (page) => {
    setCurrentPageNumber(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-6">

        {/* BACK BTN */}
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* —— Clean feminine text —— */}
        <h2 className="text-center text-4xl sm:text-5xl font-serif text-gray-900 mb-3 tracking-tight">
          Curated Luxury
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg max-w-xl mx-auto font-light mb-10">
          Beautifully selected essentials for everyday elegance ✨
        </p>

        {/* SEARCH + SORT */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          {/* SEARCH */}
          <div className="w-full md:max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for something beautiful..."
              value={searchQuery}
              onChange={(e) => {
                setSelectedCategory("all");
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 border-gray-200 bg-white
              focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition text-gray-700 placeholder-gray-400"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* SORT */}
          <div className="flex items-center gap-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border-2 border-gray-200 bg-white text-gray-700 rounded-xl px-4 py-3 pr-10
              focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition text-sm font-medium"
            >
              <option value="latest">✨ Latest</option>
              <option value="price-asc">💰 Low → High</option>
              <option value="price-desc">💎 High → Low</option>
            </select>

            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="text-sm flex items-center gap-1 text-gray-600 hover:text-pink-600"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="mb-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full capitalize text-sm font-semibold whitespace-nowrap transition 
                ${
                  selectedCategory === cat
                    ? "bg-pink-500 text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300"
                }`}
              >
                {cat === "all" ? "All Products" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ============================
              PRODUCTS GRID
        ============================ */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-14 h-14 text-pink-400 mx-auto mb-4" />
            <p className="text-gray-600">No matching products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
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
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] 
                    transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleOpenProduct(product)}
                  >
                    <div className="relative overflow-hidden bg-gray-100 h-48 sm:h-56">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />

                      {isOutOfStock && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow">
                          Out of Stock
                        </div>
                      )}

                      {inCart && !isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1.5 rounded-full text-xs font-semibold shadow flex items-center gap-1">
                          ✓ In Cart
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 
                      transition flex items-end justify-center pb-4">
                        <span className="text-white text-sm font-medium">
                          View Details
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                        {product.category}
                      </span>

                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600">
                        {product.name}
                      </h3>

                      <div className="mt-auto space-y-2">
                        <span className="text-lg sm:text-xl font-bold text-pink-600">
                          ₦{product.price.toLocaleString()}
                        </span>

                        {isOutOfStock ? (
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-xs font-semibold cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        ) : hasOptions ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProduct(product);
                            }}
                            className="w-full bg-pink-400 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-pink-500 hover:shadow-lg transition flex justify-center items-center gap-2"
                          >
                            Select Options
                          </button>
                        ) : inCart ? (
                          <button
                            onClick={(e) => handleRemoveFromCart(product._id, e)}
                            className="w-full bg-red-400 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-500 hover:shadow-lg transition flex justify-center items-center gap-2"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full bg-pink-400 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-pink-500 hover:shadow-lg transition flex justify-center items-center gap-2 
                            ${isAnimating ? "animate-bounce" : ""}`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================
                PAGINATION
            ============================ */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                {currentPageNumber > 1 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50 transition text-sm"
                  >
                    ← First
                  </button>
                )}

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
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
                          className={`min-w-[40px] px-4 py-2.5 rounded-xl font-semibold text-sm transition 
                          ${
                            page === currentPageNumber
                              ? "bg-pink-400 text-white shadow-lg scale-110"
                              : "bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                {currentPageNumber < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPageNumber + 1)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50 transition text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
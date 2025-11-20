// ================= SHOPPAGE.JS — FINAL VERSION WITH PERSISTENCE =================

import React, { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';

const ShopPage = ({
  products,
  cart,
  addToCart,
  updateQuantity,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  setSelectedProduct
}) => {

  // Always scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const dynamicCategories = Array.from(
    new Set(
      (products || [])
        .map((p) => (p.category || "").trim())
        .filter(Boolean)
   )
 );

const categories = ["all", ...dynamicCategories];

  const PRODUCTS_PER_PAGE = 20;

  // =====================================================
  // 🔥 RESTORE SAVED FILTERS (RUNS ONCE WHEN PAGE LOADS)
  // =====================================================
  useEffect(() => {
    const savedSearch = localStorage.getItem("shopSearch");
    const savedCategory = localStorage.getItem("shopCategory");
    const savedPage = localStorage.getItem("shopPage");

    if (savedSearch) setSearchQuery(savedSearch);
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedPage) setCurrentPageNumber(Number(savedPage));
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

const filteredProducts = products.filter((p) => {
  // 1. Only hide products admin manually marked invisible
  if (p.visible === false) return false;

  // 2. Category filter (case-insensitive)
  if (selectedCategory !== "all") {
    if ((p.category || "").toLowerCase().trim() !== selectedCategory.toLowerCase().trim()) {
      return false;
    }
  }

  return true;
});
// SEARCH FILTER
const searchedProducts = filteredProducts.filter((p) =>
  (p.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(searchedProducts.length / PRODUCTS_PER_PAGE) || 1;

  const startIndex = (currentPageNumber - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = searchedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // CART QUANTITY
  const getCartItemQty = (id) => {
    const found = cart.find((item) => item._id === id);
    return found ? found.quantity : 0;
  };

  // OPEN PRODUCT PAGE
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  // PAGINATION CLICK → scroll back to top
  const handlePageChange = (page) => {
    setCurrentPageNumber(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-5xl font-serif text-center mb-8 text-gray-800">
          Our Collection
        </h1>

        {/* SEARCH */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 
              bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full capitalize text-sm md:text-base transition
                ${selectedCategory === cat
                  ? "bg-pink-400 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-pink-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        {searchedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">

              {currentProducts.map((product) => {
                const qty = getCartItemQty(product._id);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden 
                    hover:scale-[1.02] hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleOpenProduct(product)}
                  >
                    {/* IMAGE FIX */}
                    <div className="relative">
                      {/* 🔥OUT OF STOCK BADGE */}
                      {typeof product.quantity === "number" && product.quantity <= 0 && (
                        <div classname="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                          Out of stock
                          </div>
                      )}

                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-56 object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <span className="text-xs text-purple-600 uppercase tracking-wide">
                        {product.category}
                      </span>

                      <h3 className="text-sm md:text-lg font-semibold mt-1 mb-2 text-gray-800 line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-lg md:text-xl font-bold text-pink-600">
                          ₦{product.price.toLocaleString()}
                        </span>

                        {/* CART LOGIC with out of Stock */}
                        {typeof product.quantity === "number" && product.quantity <= 0 ? (
                          <span classname="text-xs font-semibold text-red-500">
                            Out of Stock
                            </span>
                        ) : qty === 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="bg-pink-400 text-white px-3 md:px-4 py-2 rounded-lg 
                            text-sm hover:bg-pink-500 transition"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-pink-50 rounded-full px-3 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product._id, -1);
                              }}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm"
                            >
                              -
                            </button>

                            <span className="text-sm font-semibold">{qty}</span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================== BACK + PAGINATION ================== */}
            <div className="flex justify-center items-center gap-6 mt-10">

              {/* BACK BUTTON — goes back to page 1 */}
              <button
                onClick={() => {
                  setCurrentPageNumber(1);
                  window.scrollTo(0, 0);
                }}
                className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                ← Back
              </button>

              {/* PAGE BUTTONS */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`
                      px-4 py-2 rounded-lg border 
                      ${page === currentPageNumber
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-300"}
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
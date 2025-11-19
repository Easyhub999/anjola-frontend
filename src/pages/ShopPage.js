// SHOPPAGE.JS — FINAL UPGRADED VERSION (FULLY SYNCED WITH BACKEND)

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

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const categories = [
    "all",
    "bags",
    "self care essentials",
    "jewelries",
    "curated gift package",
    "sunglasses",
    "totes bag",
    "hair accessories"
  ];

  const PRODUCTS_PER_PAGE = 20;

  // FILTER BY CATEGORY
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // FILTER BY SEARCH
  const searchedProducts = filteredProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset page when changing category/search
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

  // OPEN PRODUCT DETAILS PAGE
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product-details");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        <h1 className="text-5xl font-serif text-center mb-8 text-gray-800">
          Our Collection
        </h1>

        {/* ========================= SEARCH ========================= */}
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

        {/* ========================= CATEGORIES ========================= */}
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

        {/* ========================= PRODUCT GRID ========================= */}
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
                    {/* IMAGE FIX — product.images[0] */}
                    <div className="relative">
                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-full h-56 object-cover"
                      />

                      <button
                        type="button"
                        className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-pink-100 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="w-5 h-5 text-pink-400" />
                      </button>
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

                        {/* CART LOGIC */}
                        {qty === 0 ? (
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
                          <div className="flex items-center gap-1 md:gap-2 bg-pink-50 rounded-full px-2 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product._id, -1);
                              }}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm"
                            >
                              -
                            </button>

                            <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                              {qty}
                            </span>

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

            {/* ========================= PAGINATION ========================= */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPageNumber(page)}
                    className={`w-10 h-10 border rounded-md text-sm font-medium
                      ${currentPageNumber === page
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-pink-100"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
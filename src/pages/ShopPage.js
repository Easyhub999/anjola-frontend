import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';

const ShopPage = ({ products, cart, addToCart, updateQuantity, searchQuery, setSearchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'bags',
    'self care essentials',
    'jewelries',
    'curated gift package',
    'sunglasses',
    'totes bag',
    'hair accessories'
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const searchedProducts = filteredProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCartItemQty = (id) => {
    const found = cart.find(item => item._id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FDECF4] to-[#F9DCEC] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-5xl font-serif text-center mb-10 text-gray-900">
          Our Collection
        </h1>

        {/* SEARCH */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 
              shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E9A8C7]"
            />
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex justify-center gap-4 mb-14 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full capitalize transition font-medium
                ${
                  selectedCategory === cat
                    ? 'bg-[#E9A8C7] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#FDECF4]'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {searchedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {searchedProducts.map(product => {
              const qty = getCartItemQty(product._id);

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden 
                  transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />

                    <button
                      className="absolute top-4 right-4 bg-white rounded-full p-2 
                      shadow-md hover:bg-[#FDECF4] transition"
                    >
                      <Heart className="w-5 h-5 text-[#E9A8C7]" />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <span className="text-xs text-[#C27CA8] uppercase tracking-wide">
                      {product.category}
                    </span>

                    <h3 className="text-lg font-semibold mt-1 mb-2 text-gray-900">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* PRICE + CART */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-[#E9A8C7]">
                        ₦{product.price.toLocaleString()}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-[#E9A8C7] text-white px-4 py-2 rounded-lg 
                          shadow hover:bg-[#D78DB2] transition"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#FDECF4] rounded-full px-3 py-1">
                          <button
                            onClick={() => updateQuantity(product._id, -1)}
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm shadow"
                          >
                            -
                          </button>

                          <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                            {qty}
                          </span>

                          <button
                            onClick={() => addToCart(product)}
                            className="w-7 h-7 rounded-full bg-[#E9A8C7] text-white flex items-center justify-center text-sm shadow"
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
        )}
      </div>
    </div>
  );
};

export default ShopPage;
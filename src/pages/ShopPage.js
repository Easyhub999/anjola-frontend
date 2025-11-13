import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';

const ShopPage = ({ products, addToCart, searchQuery, setSearchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = ['all', 'bags', 'skincare', 'accessories'];
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const searchedProducts = filteredProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-serif text-center mb-8 text-gray-800">Our Collection</h1>
        
        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full capitalize transition ${
                selectedCategory === cat
                  ? 'bg-pink-400 text-white'
                  : 'bg-white text-gray-700 hover:bg-pink-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {searchedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {searchedProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                  <button className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-pink-100 transition">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </button>
                </div>
                <div className="p-4">
                  <span className="text-xs text-purple-600 uppercase tracking-wide">{product.category}</span>
                  <h3 className="text-lg font-semibold mt-1 mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-pink-600">₦{product.price.toLocaleString()}</span>
                    <button 
                      onClick={() => addToCart(product)} 
                      className="bg-pink-400 text-white px-4 py-2 rounded-lg hover:bg-pink-500 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
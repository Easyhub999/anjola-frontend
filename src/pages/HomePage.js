import React from 'react';
import { Star, Mail } from 'lucide-react';

const HomePage = ({ products, addToCart, setCurrentPage }) => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif text-gray-800 mb-4 animate-fade-in">
            Elevate Your Beauty
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Luxury self-care products curated with love
          </p>
          <button 
            onClick={() => setCurrentPage('shop')} 
            className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-4 rounded-full text-lg hover:from-pink-500 hover:to-purple-500 transition transform hover:scale-105"
          >
            Shop Collection
          </button>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-serif text-center mb-12 text-gray-800">Featured Products</h2>
        {featuredProducts.length === 0 ? (
          <p className="text-center text-gray-600">No featured products available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-pink-600">₦{product.price.toLocaleString()}</span>
                    <button 
                      onClick={() => addToCart(product)} 
                      className="bg-pink-400 text-white px-6 py-2 rounded-lg hover:bg-pink-500 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-center mb-12 text-gray-800">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Chioma A.', text: 'The quality is amazing! My tote bag is now my daily essential.', rating: 5 },
              { name: 'Blessing O.', text: 'Under eye patches are a game changer. I look so refreshed!', rating: 5 },
              { name: 'Funmi K.', text: 'Love the aesthetic and the products. Fast delivery too!', rating: 5 }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-800">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl p-12 text-center text-white">
          <Mail className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-4">Join Our Beauty Community</h2>
          <p className="mb-6">Get exclusive offers and beauty tips delivered to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-3 rounded-lg text-gray-800" 
            />
            <button className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
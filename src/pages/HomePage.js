import React from 'react';
import { Mail } from 'lucide-react';

const HomePage = ({ products, addToCart, setCurrentPage }) => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen">

{/* Hero Section */}
<div className="relative h-[95vh] overflow-hidden flex items-center justify-center">

  {/* Ribbon Background - STRONGER */}
<img 
  src="/hero-ribbon.jpg"
  alt="Ribbon Background"
  className="
    absolute inset-0 w-full h-full 
    object-cover         /* FIXES the edges */
    object-center 
    opacity-55 
    scale-[1.3] 
    blur-[1px]
    [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0.45),rgba(0,0,0,0))]
  "
/>

  {/* Heavy Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b 
      from-white/90 via-white/70 to-white/88">
  </div>

  {/* HEAVY VIGNETTE */}
  <div className="absolute inset-0 
      bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]">
  </div>

  {/* BIGGER, STRONGER BOHO GLOW ORBS */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute w-[500px] h-[500px] bg-pink-300/50 rounded-full blur-[110px] top-0 left-0"></div>
    <div className="absolute w-[580px] h-[580px] bg-purple-300/50 rounded-full blur-[120px] bottom-0 right-0"></div>
  </div>

  {/* Strong Texture */}
  <div 
    className="absolute inset-0 opacity-[0.45] mix-blend-overlay pointer-events-none"
    style={{
      backgroundImage:
        "url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')"
    }}
  />

  {/* Hero Text */}
  <div className="relative z-10 text-center px-4">
    <h1 className="text-5xl md:text-7xl font-serif text-gray-900 
                   drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)] mb-4">
      Elevate Your Beauty
    </h1>

    <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light">
      Luxury self-care products curated with love
    </p>

    <button
      onClick={() => setCurrentPage('shop')}
      className="bg-gradient-to-r from-pink-400 to-purple-500 text-white 
                 px-12 py-4 rounded-full text-xl shadow-[0_10px_25px_rgba(0,0,0,0.25)] 
                 hover:scale-110 active:scale-95 transition-transform"
    >
      Shop Collection
    </button>
  </div>

</div>

      {/* ========================= FEATURED PRODUCTS ========================= */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-5xl font-serif text-center mb-16 text-gray-900 tracking-wide">
          Featured Products
        </h2>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-gray-600">No featured products available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {featuredProducts.map(product => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden 
                transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover group-hover:scale-105 
                    transition-all duration-500"
                  />

                  {/* Floating price */}
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md 
                  shadow-md px-4 py-1 rounded-full text-pink-600 font-bold text-lg">
                    ₦{product.price.toLocaleString()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {product.description}
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white 
                    py-3 rounded-xl font-medium hover:scale-[1.02] transition-transform"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================= TESTIMONIALS ========================= */}
      <div className="relative py-24 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/40">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 bg-pink-200/30 rounded-full blur-3xl top-10 left-10"></div>
          <div className="absolute w-72 h-72 bg-purple-200/30 rounded-full blur-3xl bottom-10 right-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-serif text-center mb-16 text-gray-900">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: 'Morenikeji A.',
                text: '“The quality is beyond my expectations. My tote bag is now my everyday essential.”',
                rating: 5
              },
              {
                name: 'Anuoluwapo O.',
                text: '“The under-eye patches made me look refreshed instantly. Luxury at its finest.”',
                rating: 5
              },
              {
                name: 'Adenike F.',
                text: '“Excellent packaging and fast delivery. The aesthetic alone made me fall in love.”',
                rating: 5
              }
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8 
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09L5.5 12 1 7.91l6.061-.91L10 2l2.939 5 6.061.91L14.5 12l1.378 6.09z" />
                    </svg>
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  {t.text}
                </p>

                {/* Name */}
                <p className="font-semibold text-gray-900 tracking-wide">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================= NEWSLETTER ========================= */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 
          rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">

          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/736x/4a/61/2a/4a612a4957332c87a1e64da3d57c01ad.jpg')"
            }}
          ></div>

          <div className="relative z-10">
            <Mail className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-lg" />

            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white drop-shadow">
              Join Our Beauty Community
            </h2>

            <p className="text-white/90 max-w-xl mx-auto mb-8 text-lg">
              Get exclusive offers, restock alerts, discount drops and beauty inspiration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address…"
                className="flex-1 px-5 py-4 rounded-xl text-gray-800 shadow-md 
                focus:outline-none focus:ring-4 focus:ring-white/40"
              />

              <button className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold 
                shadow-lg hover:bg-gray-100 transition transform hover:scale-[1.03]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
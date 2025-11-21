import React from "react";
import { Mail, Sparkles, Heart, Gift, Star } from "lucide-react";

const HomePage = ({ products, cart, addToCart, updateQuantity, setCurrentPage, setSelectedProduct }) => {
  const featuredProducts = products.filter((p) => p.featured && p.visible !== false).slice(0, 3);

  const getCartItemQty = (id) => {
    const found = cart.find((item) => item._id === id);
    return found ? found.quantity : 0;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  return (
    <div className="min-h-screen">

      {/* ================= ANIMATED MARQUEE BANNER ================= */}
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white py-3 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center">
                <span className="flex items-center gap-3 text-sm font-semibold tracking-wide mx-8">
                  <Sparkles className="w-4 h-4" />
                  Hi Girlies💕🎀, welcome. 🤗🌸 Anjola_aesthetics_ng is  live! 🎉 Follow us on TikTok & Instagram for daily updates!
                  <Heart className="w-4 h-4 fill-current" />
                </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= HERO SECTION (KEEP RIBBON) ================= */}
      <div className="relative h-[95vh] overflow-hidden flex items-center justify-center">

        {/* Client's Ribbon Logo Background */}
        <img
          src="/hero-ribbon.jpg"
          alt="Ribbon Background"
          className="absolute inset-0 w-full h-full object-cover opacity-55 scale-[1.3] blur-[1px]
            [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0.45),rgba(0,0,0,0))]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]" />

        {/* Floating Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] bg-pink-300/50 rounded-full blur-[110px] top-0 left-0 animate-float-slow" />
          <div className="absolute w-[580px] h-[580px] bg-purple-300/50 rounded-full blur-[120px] bottom-0 right-0 animate-float-slow" style={{ animationDelay: '2s' }} />
          
          {/* Sparkle elements */}
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-pink-400/30 animate-twinkle"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 20 + 15}px`,
                height: `${Math.random() * 20 + 15}px`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 opacity-[0.45] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 animate-fadeInUp">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
            <Sparkles className="w-6 h-6 text-purple-500 animate-spin-slow" />
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-4 drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)] animate-slideInDown">
            Elevate Your Beauty
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Luxury self-care products curated with love 💕
          </p>

          <button
            onClick={() => setCurrentPage("shop")}
            className="group relative bg-gradient-to-r from-pink-400 to-purple-500 text-white 
              px-12 py-4 rounded-full text-xl shadow-[0_10px_25px_rgba(0,0,0,0.25)]
              hover:scale-110 active:scale-95 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: '0.6s' }}
          >
            <span className="flex items-center gap-3">
              Shop Collection
              <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </span>
          </button>
        </div>
      </div>

      {/* ================= BENEFITS SECTION ================= */}
      <div className="py-16 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🎁", title: "Free Gift Wrap", desc: "Beautifully packaged" },
              { icon: "🚚", title: "Fast Shipping", desc: "2-3 business days" },
              { icon: "💝", title: "Secure Checkout", desc: "100% protected" },
              { icon: "✨", title: "Premium Quality", desc: "Luxury products" },
            ].map((benefit, i) => (
              <div key={i} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                <p className="text-xs text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= FEATURED PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-16 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-400 fill-current animate-pulse" />
            <span className="text-pink-600 font-semibold uppercase tracking-wider text-sm">Handpicked For You</span>
            <Star className="w-6 h-6 text-yellow-400 fill-current animate-pulse" />
          </div>
          <h2 className="text-5xl font-serif text-gray-900 tracking-wide mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of luxury self-care essentials
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-gray-600">No featured products available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, idx) => {
              const qty = getCartItemQty(product._id);

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden 
                    transform hover:-translate-y-2 transition-all duration-300 cursor-pointer
                    border border-gray-100 hover:border-pink-200 animate-fadeInUp"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-all duration-500"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Featured badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md 
                      shadow-lg px-4 py-2 rounded-full text-pink-600 font-bold text-lg">
                      ₦{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {product.description}
                    </p>

                    {qty === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white 
                          py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] 
                          transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl px-4 py-3 border border-pink-200">
                        <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500 fill-current" />
                          In cart
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product._id, -1);
                            }}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                          >
                            -
                          </button>

                          <span className="min-w-[1.5rem] text-center font-bold text-pink-600">{qty}</span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:bg-pink-600 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentPage("shop")}
            className="bg-white text-pink-600 border-2 border-pink-400 px-8 py-3 rounded-full font-semibold hover:bg-pink-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl"
          >
            View All Products →
          </button>
        </div>
      </div>

      {/* ================= WHY CHOOSE US ================= */}
      <div className="py-20 bg-gradient-to-b from-white via-pink-50/40 to-white relative overflow-hidden">
        {/* Floating hearts */}
        {[...Array(8)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-pink-200/30 animate-float-slow"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 90 + 5}%`,
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${Math.random() * 5 + 8}s`
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-serif text-center mb-4 text-gray-900 animate-fadeIn">
            Why Choose Us
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Experience the difference of luxury self-care with our premium collection
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "/quality.png",
                title: "Premium Quality",
                desc: "Carefully selected items crafted for beauty, durability and long-lasting value.",
                icon: <Sparkles className="w-6 h-6 text-pink-500" />
              },
              {
                img: "/fast.png",
                title: "Fast Delivery",
                desc: "Swift nationwide delivery — beautifully packaged and right on time.",
                icon: <Gift className="w-6 h-6 text-purple-500" />
              },
              {
                img: "/trust.png",
                title: "Trusted by Women",
                desc: "Loved for elegance, reliability and consistent customer satisfaction.",
                icon: <Heart className="w-6 h-6 text-pink-500 fill-current" />
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-xl rounded-2xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 group animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-pink-200/50 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <img src={item.img} alt={item.title} className="relative w-20 h-20 mx-auto" />
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  {item.icon}
                  <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div className="relative py-24 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/40 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-64 h-64 bg-pink-200/30 rounded-full blur-3xl top-10 left-10 animate-pulse-slow" />
          <div className="absolute w-72 h-72 bg-purple-200/30 rounded-full blur-3xl bottom-10 right-20 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-pink-600 font-semibold uppercase tracking-wider text-sm">Testimonials</span>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
            <h2 className="text-5xl font-serif text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their beauty needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Morenikeji A.",
                text: "The quality is beyond my expectations. My tote bag is now my everyday essential.",
                rating: 5,
                avatar: "M"
              },
              {
                name: "Anuoluwapo O.",
                text: "The under-eye patches made me look refreshed instantly. Luxury at its finest.",
                rating: 5,
                avatar: "A"
              },
              {
                name: "Adenike F.",
                text: "Excellent packaging and fast delivery. The aesthetic alone made me fall in love.",
                rating: 5,
                avatar: "A"
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 
                hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-pink-200 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-base italic leading-relaxed">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= NEWSLETTER ================= */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 
          rounded-3xl p-12 text-center shadow-2xl overflow-hidden"
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://i.pinimg.com/736x/4a/61/2a/4a612a4957332c87a1e64da3d57c01ad.jpg')",
            }}
          />

          {/* Floating sparkles */}
          {[...Array(5)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-white/20 animate-twinkle"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 30 + 20}px`,
                height: `${Math.random() * 30 + 20}px`,
                animationDelay: `${i * 0.7}s`
              }}
            />
          ))}

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-16 h-16 text-white drop-shadow-lg" />
              <Heart className="w-10 h-10 text-white fill-current animate-pulse" />
            </div>

            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white drop-shadow-lg">
              Join Our Beauty Community
            </h2>

            <p className="text-white/90 max-w-xl mx-auto mb-8 text-lg">
              Get exclusive offers, restock alerts, discount drops and beauty inspiration 💕
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address…"
                className="flex-1 px-5 py-4 rounded-xl text-gray-800 shadow-xl 
                focus:outline-none focus:ring-4 focus:ring-white/40 transition-all"
                style={{ fontSize: '16px' }}
              />

              <button
                className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold shadow-xl 
                hover:bg-gray-100 transition-all transform hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Subscribe
              </button>
            </div>

            <p className="text-white/70 text-xs mt-4">
              ✨ Join 10,000+ subscribers who get the best deals first!
            </p>
          </div>
        </div>
      </div>
      
       {/* ================= ANIMATIONS CSS ================= */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-15px) translateX(5px);
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.8s ease-out forwards;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default HomePage;
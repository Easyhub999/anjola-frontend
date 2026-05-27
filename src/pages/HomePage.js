import { useEffect, useRef, useState } from "react";
import { Sparkles, Heart, Gift, Star, ArrowRight, ShoppingBag, Truck, Shield, Package } from "lucide-react";

// Animated counter that counts up when visible
const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseFloat(target);
    const duration = 2000;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  );
};

// Scroll animation hook
const useScrollAnimation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const el = ref.current;
    if (el) {
      const animatedElements = el.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .stagger-children');
      animatedElements.forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
};

const HomePage = ({ products, cart, addToCart, updateQuantity, setCurrentPage, setSelectedProduct }) => {
  const featuredProducts = products.filter((p) => p.featured && p.visible !== false).slice(0, 3);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const containerRef = useScrollAnimation();

  const getCartItemQty = (id) => {
    const found = cart.find((item) => item._id === id);
    return found ? found.quantity : 0;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  // Check for payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    if (reference) {
      setShowSuccessModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Parallax effect for hero
  const [heroOffset, setHeroOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setHeroOffset(window.scrollY * 0.3);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get unique categories for "Shop by Category"
  const categories = products
    .filter(p => p.visible !== false && p.category)
    .reduce((acc, p) => {
      const cat = p.category.toLowerCase().trim();
      if (!acc.find(c => c.name === cat)) {
        acc.push({ name: cat, image: p.images?.[0] || p.image || '/placeholder.png' });
      }
      return acc;
    }, [])
    .slice(0, 4);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fff7f9]">

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] px-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full shadow-luxury-xl animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-gray-900 text-center mb-3">
              Payment Successful!
            </h2>
            <p className="text-gray-500 text-center mb-8 leading-relaxed">
              Thank you for your order! We've sent a confirmation email with your order details.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 bg-rose-50 p-4 rounded-xl">
                <Package className="w-5 h-5 text-[#e84393] mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Order Confirmed</p>
                  <p className="text-xs text-gray-500">Check your email for details</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-xl">
                <Truck className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Processing Your Order</p>
                  <p className="text-xs text-gray-500">Ships within 2-3 business days</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href="https://wa.me/2347065943625?text=Hi%20Anjola%20Aesthetics!%20I%20just%20placed%20an%20order%20and%20would%20like%20to%20track%20it."
                target="_blank" rel="noopener noreferrer"
                className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                Track via WhatsApp
              </a>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white py-3.5 rounded-xl font-semibold hover:from-[#d63384] hover:to-[#9333ea] transition-all magnetic-btn"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CINEMATIC HERO ================= */}
      <div className="relative h-[100vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        {/* Background with parallax */}
        <div className="absolute inset-0" style={{ transform: `translateY(${heroOffset}px)` }}>
          <img
            src="/hero-ribbon.jpg"
            alt="Ribbon Background"
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: 'brightness(0.85) saturate(0.9)' }}
          />
        </div>

        {/* Elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff7f9]/85 via-[#fff7f9]/60 to-[#fff7f9]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(139,94,131,0.08)_100%)]" />

        {/* Floating accent shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[400px] h-[400px] bg-[#f9a8d4]/20 rounded-full blur-[100px] -top-20 -left-20 animate-float" />
          <div className="absolute w-[350px] h-[350px] bg-[#d8b4fe]/20 rounded-full blur-[100px] -bottom-20 -right-20 animate-float-delayed" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Subtle pre-title */}
          <div className="animate-fadeIn mb-6" style={{ animationDelay: '0.2s' }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-[#e84393] text-sm font-medium tracking-wide border border-[#e84393]/10">
              <Sparkles className="w-3.5 h-3.5" />
              Luxury Self-Care Essentials
            </span>
          </div>

          {/* Main heading with text reveal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 mb-6 leading-[1.1] animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            Elevate Your
            <br />
            <span className="text-gradient italic">Beauty</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 font-light leading-relaxed max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            Curated with love — premium beauty products for the modern woman
            who values elegance and self-care.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <button
              onClick={() => setCurrentPage("shop")}
              className="group bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white px-10 py-4 rounded-full text-lg font-medium
                hover:from-[#d63384] hover:to-[#9333ea] shadow-lg hover:shadow-xl transition-all duration-400 magnetic-btn
                flex items-center gap-3"
            >
              Shop Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('brand-story');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-600 hover:text-[#e84393] px-8 py-4 rounded-full text-lg font-medium
                border border-gray-200 hover:border-[#e84393]/30 transition-all duration-300"
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ================= TRUST STRIP ================= */}
      <div className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="scroll-animate grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Gift className="w-5 h-5" />, title: "Gift Wrapping", desc: "Beautifully packaged" },
              { icon: <Truck className="w-5 h-5" />, title: "Fast Shipping", desc: "2-3 business days" },
              { icon: <Shield className="w-5 h-5" />, title: "Secure Checkout", desc: "100% protected" },
              { icon: <Sparkles className="w-5 h-5" />, title: "Premium Quality", desc: "Handpicked products" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 rounded-full bg-[#e84393]/8 flex items-center justify-center text-[#e84393] flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= FEATURED PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="scroll-animate text-center mb-16">
          <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-3">
            Handpicked For You
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Our most loved products, carefully curated for everyday luxury
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No featured products available</p>
        ) : (
          <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, idx) => {
              const qty = getCartItemQty(product._id);

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden
                    transform hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-gray-100"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Subtle hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Featured badge */}
                    <div className="absolute top-4 left-4 bg-[#e84393] text-white px-3 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md shadow-lg px-4 py-2 rounded-full">
                      {product.salesPrice && product.salesPrice < product.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <span className="text-[#e84393] font-bold text-lg">
                            ₦{product.salesPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#e84393] font-bold text-lg">
                          ₦{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quick View on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        View Details
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-[#e84393] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {qty === 0 ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="w-full bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white py-3 rounded-xl font-medium
                          hover:from-[#d63384] hover:to-[#9333ea] transition-all duration-300 flex items-center justify-center gap-2 magnetic-btn shadow-md hover:shadow-lg"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#e84393] fill-current" />
                          In cart
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(product._id, -1); }}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all text-gray-700"
                          >-</button>
                          <span className="min-w-[1.5rem] text-center font-bold text-[#e84393]">{qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            className="w-8 h-8 rounded-full bg-[#e84393] text-white flex items-center justify-center shadow-sm hover:shadow-md hover:bg-[#d63384] transition-all"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All */}
        <div className="scroll-animate text-center mt-14">
          <button
            onClick={() => setCurrentPage("shop")}
            className="group inline-flex items-center gap-2 text-[#e84393] hover:text-[#d63384] font-medium text-lg border-b-2 border-[#e84393]/30 hover:border-[#e84393] pb-1 transition-all duration-300"
          >
            View All Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* ================= SHOP BY CATEGORY ================= */}
      {categories.length > 0 && (
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="scroll-animate text-center mb-16">
              <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-3">
                Browse Collections
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
                Shop by Category
              </h2>
            </div>

            <div className="stagger-children grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat, idx) => (
                <button
                  key={cat.name}
                  onClick={() => setCurrentPage("shop")}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-serif text-xl capitalize mb-1">{cat.name}</h3>
                    <span className="text-white/70 text-sm font-medium flex items-center gap-1 group-hover:text-white transition-colors">
                      Explore
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= BRAND STORY ================= */}
      <div id="brand-story" className="py-24 bg-[#fff7f9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — Image collage */}
            <div className="scroll-animate-left relative">
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury-lg">
                  <img
                    src="/hero-ribbon.jpg"
                    alt="Anjola Aesthetics"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating accent card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-luxury p-5 max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-[#e84393] fill-current" />
                    <span className="text-sm font-semibold text-gray-900">Trusted</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Loved by women across Nigeria for quality and elegance
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Story */}
            <div className="scroll-animate-right">
              <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-4">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                Beauty That Speaks
                <br />
                <span className="italic text-[#e84393]">to Your Soul</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                <p>
                  Anjola Aesthetics was born from a simple belief: every woman deserves to feel
                  luxurious in her daily routine. We carefully select each product for its quality,
                  beauty, and the joy it brings.
                </p>
                <p>
                  From self-care essentials to aesthetic accessories, everything in our collection
                  is curated with the same love and attention we'd give to a gift for our closest
                  friends.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { target: 500, suffix: '+', decimals: 0, label: "Happy Customers" },
                  { target: 50, suffix: '+', decimals: 0, label: "Products" },
                  { target: 4.9, suffix: '', decimals: 1, label: "Avg. Rating" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                      <AnimatedCounter target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage("shop")}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white px-8 py-3.5 rounded-full font-medium
                  hover:from-[#d63384] hover:to-[#9333ea] shadow-md hover:shadow-lg transition-all duration-300 magnetic-btn"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= WHY CHOOSE US ================= */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="scroll-animate text-center mb-16">
            <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-3">
              The Anjola Difference
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
              Why Choose Us
            </h2>
          </div>

          <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "/quality.png",
                title: "Premium Quality",
                desc: "Carefully selected items crafted for beauty, durability and long-lasting value.",
                icon: <Sparkles className="w-5 h-5 text-[#e84393]" />
              },
              {
                img: "/fast.png",
                title: "Fast Delivery",
                desc: "Swift nationwide delivery — beautifully packaged and right on time.",
                icon: <Truck className="w-5 h-5 text-[#e84393]" />
              },
              {
                img: "/trust.png",
                title: "Trusted by Women",
                desc: "Loved for elegance, reliability and consistent customer satisfaction.",
                icon: <Heart className="w-5 h-5 text-[#e84393] fill-current" />
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#fff7f9] rounded-2xl p-8 text-center hover:-translate-y-2 hover:shadow-luxury transition-all duration-500 border border-gray-100 group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-[#e84393]/10 rounded-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-500"></div>
                  <img src={item.img} alt={item.title} className="relative w-20 h-20 mx-auto" />
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  {item.icon}
                  <h3 className="text-xl font-serif text-gray-900">{item.title}</h3>
                </div>

                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div className="py-24 bg-[#fff7f9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="scroll-animate text-center mb-16">
            <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-3">
              Customer Love
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
              What They Say
            </h2>
          </div>

          <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Morenikeji A.",
                text: "The quality is beyond my expectations. My tote bag is now my everyday essential. Absolutely love the packaging too!",
                rating: 5,
              },
              {
                name: "Anuoluwapo O.",
                text: "The under-eye patches made me look refreshed instantly. This is luxury at its finest. Will definitely order again.",
                rating: 5,
              },
              {
                name: "Adenike F.",
                text: "Excellent packaging and fast delivery. The aesthetic alone made me fall in love. Perfect gifts for my friends!",
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover
                  hover:-translate-y-2 transition-all duration-500 border border-gray-100"
              >
                {/* Quote mark */}
                <div className="text-5xl font-serif text-[#e84393]/15 leading-none mb-4">"</div>

                <p className="text-gray-600 text-base leading-relaxed mb-6 italic">
                  {t.text}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e84393] to-[#f472b6] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= NEWSLETTER ================= */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="scroll-animate-scale relative bg-gradient-to-br from-[#e84393] via-[#a855f7] to-[#e84393] rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-white/60 mx-auto mb-4" />

              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                Join Our Beauty Community
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">
                Get exclusive offers, restock alerts, and beauty inspiration delivered to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  className="flex-1 px-5 py-4 rounded-xl text-gray-800 bg-white shadow-lg
                    focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder-gray-400"
                  style={{ fontSize: '16px' }}
                />
                <button className="bg-white text-[#e84393] px-8 py-4 rounded-xl font-semibold shadow-lg
                  hover:bg-gray-50 transition-all duration-300 magnetic-btn flex-shrink-0">
                  Subscribe
                </button>
              </div>

              <p className="text-white/40 text-xs mt-4">
                Join 10,000+ subscribers. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

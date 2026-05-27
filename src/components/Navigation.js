// src/components/Navigation.js
import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Sparkles,
  Home,
  ShoppingBag,
  BookOpen,
  MessageCircle,
  Package,
  BarChart3,
  ClipboardList,
  LogIn,
  LogOut,
  ChevronRight,
  Instagram,
  Phone
} from "lucide-react";

const Navigation = ({
  currentPage,
  setCurrentPage,
  cart,
  showCart,
  setShowCart,
  showMobileMenu,
  setShowMobileMenu,
  user,
  cartBump,
  handleLogout,
}) => {
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const marqueeRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for transparent-to-solid nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Marquee animation
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.4;
    let rafId;

    const animate = () => {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= marquee.scrollWidth / 3) {
        scrollAmount = 0;
      }
      marquee.style.transform = `translateX(-${scrollAmount}px)`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  const menuItems = [
    { label: "Home", page: "home", icon: Home },
    { label: "Shop", page: "shop", icon: ShoppingBag },
    { label: "Blog", page: "blog", icon: BookOpen },
    { label: "Contact", page: "contact", icon: MessageCircle },
  ];

  const adminItems = [
    { label: "Products", page: "admin", icon: Package },
    { label: "Analytics", page: "admin-analytics", icon: BarChart3 },
    { label: "Orders", page: "admin-orders", icon: ClipboardList },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[999]">
      {/* ELEGANT MARQUEE BANNER */}
      <div className="w-full bg-gradient-to-r from-[#e84393] via-[#a855f7] to-[#e84393] text-white overflow-hidden py-2.5">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-4 text-[13px] font-medium tracking-wide mx-8"
            >
              <Sparkles className="w-3.5 h-3.5 opacity-80" />
              <span>Welcome to Anjola Aesthetics</span>
              <span className="opacity-40">|</span>
              <span>Free Gift Wrapping on All Orders</span>
              <span className="opacity-40">|</span>
              <span>Follow us @anjola_aesthetics_ng02</span>
              <span className="opacity-40">|</span>
              <span>New Arrivals Weekly</span>
              <span className="opacity-40">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN NAVIGATION BAR — transparent-to-solid on scroll */}
      <div className={`transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50'
          : 'bg-white/60 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentPage("home")}
          >
            <img
              src="/anjola-favicon-v2.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
            <div className="leading-tight">
              <div className="text-[20px] font-serif font-semibold text-gray-900 tracking-tight">
                Anjola
              </div>
              <div className="text-[12px] font-sans font-medium text-[#e84393] tracking-[0.15em] uppercase -mt-0.5">
                Aesthetics
              </div>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`relative text-[15px] font-medium tracking-wide transition-colors duration-300 py-1 ${
                  currentPage === item.page
                    ? "text-[#e84393]"
                    : "text-gray-600 hover:text-[#e84393]"
                }`}
              >
                {item.label}
                {currentPage === item.page && (
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-[#e84393] to-[#f9a8d4] rounded-full"></span>
                )}
              </button>
            ))}

            {/* ADMIN LINKS */}
            {user?.role === "admin" && (
              <>
                <div className="w-px h-5 bg-gray-300"></div>
                {adminItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className={`text-[14px] font-medium transition-colors duration-300 ${
                      currentPage === item.page
                        ? "text-rose-600"
                        : "text-rose-400 hover:text-rose-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-4">
            {/* CART */}
            <button
              className="relative p-2 hover:bg-gray-100/80 rounded-xl transition-colors duration-300"
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingCart className={`w-[22px] h-[22px] transition-colors duration-300 ${
                scrolled ? 'text-gray-700' : 'text-gray-700'
              } hover:text-[#e84393]`} />

              {cartTotalQty > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-[#e84393] text-white text-[10px]
                    min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-sm font-semibold
                    ${cartBump ? "cart-bump" : ""}`}
                >
                  {cartTotalQty}
                </span>
              )}
            </button>

            {/* PROFILE */}
            <button
              className="p-2 hover:bg-gray-100/80 rounded-xl transition-colors duration-300"
              onClick={() => setCurrentPage(user ? "profile" : "auth")}
            >
              <User className="w-[22px] h-[22px] text-gray-700 hover:text-[#e84393] transition-colors duration-300" />
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2 hover:bg-gray-100/80 rounded-xl transition-colors duration-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {showMobileMenu && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* MENU PANEL */}
          <div className="fixed top-0 right-0 h-screen w-[80%] max-w-[320px] bg-white shadow-luxury-xl z-[1001] md:hidden overflow-y-auto animate-slideInRight">

            {/* HEADER */}
            <div className="bg-gradient-to-br from-[#e84393] via-[#d63384] to-[#a855f7] px-6 py-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span className="text-white/90 font-medium text-sm tracking-wide">Menu</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1.5 bg-white/15 rounded-full hover:bg-white/25 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* USER SECTION */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20">
                  {user ? (
                    <span className="text-white text-lg font-bold font-serif">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white/80" />
                  )}
                </div>
                <div>
                  {user ? (
                    <>
                      <p className="text-white font-semibold">{user.name || "User"}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-400/90 text-amber-900 text-[10px] font-bold rounded-full">
                          Admin
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-white font-semibold">Welcome</p>
                      <p className="text-white/60 text-sm">Sign in to continue</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN MENU */}
            <div className="px-4 py-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">
                Navigation
              </p>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => {
                        setCurrentPage(item.page);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-[#e84393] text-white shadow-md"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#e84393]"}`} />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-white/70" : "text-gray-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADMIN SECTION */}
            {user?.role === "admin" && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-[0.15em] mb-3 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                  Admin
                </p>
                <div className="space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <button
                        key={item.page}
                        onClick={() => {
                          setCurrentPage(item.page);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-rose-500 text-white shadow-md"
                            : "hover:bg-rose-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-rose-100"}`}>
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-rose-500"}`} />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? "text-white/70" : "text-gray-300"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AUTH BUTTON */}
            <div className="px-4 py-4 border-t border-gray-100">
              {user ? (
                <button
                  onClick={() => {
                    if (handleLogout) handleLogout();
                    setShowMobileMenu(false);
                    setCurrentPage("home");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-medium text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPage("auth");
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e84393] text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              )}
            </div>

            {/* SOCIAL LINKS */}
            <div className="px-4 py-4 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2">
                Connect
              </p>
              <div className="flex items-center gap-3 px-2">
                <a href="https://www.instagram.com/anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl text-white hover:scale-105 transition-transform shadow-sm">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com/@anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-gray-900 rounded-xl text-white hover:scale-105 transition-transform shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="https://wa.me/2347065943625" target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-500 rounded-xl text-white hover:scale-105 transition-transform shadow-sm">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-5 text-center">
              <p className="text-[11px] text-gray-400">
                &copy; {new Date().getFullYear()} Anjola Aesthetics Ng
              </p>
            </div>
          </div>
        </>
      )}

      {/* ANIMATIONS */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </nav>
  );
};

export default Navigation;

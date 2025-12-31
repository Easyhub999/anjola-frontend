// src/components/Navigation.js
import React, { useEffect, useRef } from "react";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Sparkles, 
  Heart,
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

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;

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

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Menu items with icons
  const menuItems = [
    { label: "Home", page: "home", icon: Home },
    { label: "Shop", page: "shop", icon: ShoppingBag },
    { label: "Blog", page: "blog", icon: BookOpen },
    { label: "Contact", page: "contact", icon: MessageCircle },
  ];

  // Admin menu items
  const adminItems = [
    { label: "Products", page: "admin", icon: Package },
    { label: "Analytics", page: "admin-analytics", icon: BarChart3 },
    { label: "Orders", page: "admin-orders", icon: ClipboardList },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[999] shadow-sm bg-white/80 backdrop-blur-lg">
      {/* 🔥 ANIMATED MARQUEE BANNER */}
      <div className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white overflow-hidden py-3">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-3 text-sm font-semibold mx-8"
            >
              <Sparkles className="w-4 h-4" />
              Hi Loves 💕🎀, welcome. 🤗🌸 Anjola_aesthetics_ng is live! 🎉
              <Heart className="w-4 h-4 fill-current" />
              <span className="mx-4">•</span>
              Follow us on TikTok & Instagram for daily updates! ✨
              <span className="mx-4">•</span>
              New stock arrived! Start shopping 🛍️
              <span className="mx-4">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage("home")}
        >
          <img
            src="/anjola-favicon-v2.png"
            alt="Logo"
            className="w-10 h-10 rounded-xl shadow-sm"
          />

          <div className="leading-tight">
            <div className="text-[20px] font-serif font-semibold text-gray-900">
              Anjola
            </div>
            <div className="text-[14px] font-serif text-gray-700 -mt-1">
              Aesthetics Ng
            </div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`relative text-lg font-medium transition ${
                currentPage === item.page
                  ? "text-pink-600"
                  : "text-gray-700 hover:text-pink-500"
              }`}
            >
              {item.label}
              {currentPage === item.page && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-pink-600"></span>
              )}
            </button>
          ))}

          {/* ADMIN LINKS - DESKTOP */}
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setCurrentPage("admin")}
                className={`text-lg font-medium transition ${
                  currentPage === "admin"
                    ? "text-red-600"
                    : "text-red-500 hover:text-red-700"
                }`}
              >
                Products
              </button>

              <button
                onClick={() => setCurrentPage("admin-analytics")}
                className={`text-lg font-medium transition ${
                  currentPage === "admin-analytics"
                    ? "text-red-600"
                    : "text-red-500 hover:text-red-700"
                }`}
              >
                Analytics
              </button>

              <button
                onClick={() => setCurrentPage("admin-orders")}
                className={`text-lg font-medium transition ${
                  currentPage === "admin-orders"
                    ? "text-red-600"
                    : "text-red-500 hover:text-red-700"
                }`}
              >
                Orders
              </button>
            </>
          )}
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-6">
          {/* CART */}
          <button
            className="relative hover:scale-110 transition"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="w-7 h-7 text-gray-700 hover:text-pink-500" />

            {cartTotalQty > 0 && (
              <span
                className={`absolute -top-2 -right-2 bg-pink-500 text-white text-xs 
                  px-2 py-0.5 rounded-full shadow font-semibold
                  ${cartBump ? "cart-bump" : ""}`}
              >
                {cartTotalQty}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <button onClick={() => setCurrentPage(user ? "profile" : "auth")}>
            <User className="w-7 h-7 text-gray-700 hover:text-pink-500 transition" />
          </button>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="w-8 h-8 text-gray-700" />
            ) : (
              <Menu className="w-8 h-8 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* ✨ UPGRADED MOBILE RIGHT-SIDE DRAWER */}
      {showMobileMenu && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* MENU PANEL */}
          <div
            className="
              fixed top-0 right-0 h-screen w-[75%] max-w-[300px]
              bg-gradient-to-b from-white to-pink-50
              shadow-2xl z-[1001] md:hidden overflow-y-auto
              animate-slideInRight
            "
          >
            {/* HEADER WITH CLOSE & BRANDING */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Menu</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* USER PROFILE SECTION */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {user ? (
                    <span className="text-white text-lg font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  {user ? (
                    <>
                      <p className="text-white font-semibold">{user.name || "User"}</p>
                      <p className="text-white/70 text-sm">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          ✨ Admin
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-white font-semibold">Welcome, Guest!</p>
                      <p className="text-white/70 text-sm">Sign in to continue</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN MENU ITEMS */}
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Navigation
              </p>

              <div className="space-y-1">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;

                  return (
                    <button
                      key={item.page}
                      onClick={() => {
                        setCurrentPage(item.page);
                        setShowMobileMenu(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${isActive 
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg" 
                          : "hover:bg-pink-100 text-gray-700"
                        }
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-pink-100"}`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-pink-500"}`} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADMIN SECTION */}
            {user?.role === "admin" && (
              <div className="px-4 py-2 border-t border-pink-200">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Admin Panel
                </p>

                <div className="space-y-1">
                  {adminItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;

                    return (
                      <button
                        key={item.page}
                        onClick={() => {
                          setCurrentPage(item.page);
                          setShowMobileMenu(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isActive 
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg" 
                            : "hover:bg-red-50 text-gray-700"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-red-100"}`}>
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-red-500"}`} />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AUTH BUTTON */}
            <div className="px-4 py-4 border-t border-pink-200">
              {user ? (
                <button
                  onClick={() => {
                    if (handleLogout) handleLogout();
                    setShowMobileMenu(false);
                    setCurrentPage("home");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPage("auth");
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In / Register
                </button>
              )}
            </div>

            {/* SOCIAL LINKS */}
            <div className="px-4 py-4 border-t border-pink-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Connect With Us
              </p>

              <div className="flex items-center gap-3 px-2">
                <a
                  href="https://www.instagram.com/anjola_aesthetics_ng02?igsh=amFxeGJmd3NvNW55"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl text-white hover:scale-110 transition shadow-lg"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                <a
                  href="https://tiktok.com/@anjola_aesthetics_ng02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-black rounded-xl text-white hover:scale-110 transition shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>

                <a
                  href="https://wa.me/2347065943625"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-green-500 rounded-xl text-white hover:scale-110 transition shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* FOOTER BRANDING */}
            <div className="px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="text-sm text-gray-500">Made with love</span>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Anjola Aesthetics Ng
              </p>
            </div>
          </div>
        </>
      )}

      {/* ANIMATIONS */}
      <style>{`
        @keyframes slideInRight {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
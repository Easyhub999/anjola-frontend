// src/components/Navigation.js
import React from "react";
import { ShoppingCart, User, Menu, X, Sparkles, Heart } from "lucide-react";

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
}) => {

  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="w-full z-[9999] shadow-sm bg-white/80 backdrop-blur-lg">

      {/* 🔥 Marquee INSIDE NavBar (Smooth + No overlap) */}
      <div className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white overflow-hidden py-2">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-2 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Hi Girlies💕🎀, welcome 💖 — Follow @Anjola_aesthetics_ng for updates!
              <Heart className="w-4 h-4 fill-current" />
            </span>
          ))}
        </div>
      </div>

      {/* ============================
          MAIN NAVIGATION BAR
      ============================ */}
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
            <div className="text-[20px] font-serif font-semibold text-gray-900">Anjola</div>
            <div className="text-[14px] font-serif text-gray-700 -mt-1">Aesthetics Ng</div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Home", page: "home" },
            { label: "Shop", page: "shop" },
            { label: "Blog", page: "blog" },
            { label: "Contact", page: "contact" },
          ].map((item) => (
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
                className={`absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow font-semibold ${
                  cartBump ? "cart-bump" : ""
                }`}
              >
                {cartTotalQty}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <button onClick={() => setCurrentPage(user ? "profile" : "auth")}>
            <User className="w-7 h-7 text-gray-700 hover:text-pink-500 transition" />
          </button>

          {/* MOBILE MENU */}
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

      {/* MOBILE DROPDOWN */}
      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-lg px-6 py-6 space-y-5 border-t">
          {["home", "shop", "blog", "contact"].map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left text-lg py-2 font-medium ${
                currentPage === page ? "text-pink-600" : "text-gray-800"
              }`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
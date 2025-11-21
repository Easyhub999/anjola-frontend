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
    <nav className="fixed top-0 left-0 w-full z-[999] shadow-sm bg-white/80 backdrop-blur-lg overflow-hidden">

      {/* 🔥 ANIMATED MARQUEE BANNER */}
      <div className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white overflow-hidden py-3">
        <div className="animate-marquee-scroll whitespace-nowrap inline-flex">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 text-sm font-semibold mx-8"
            >
              <Sparkles className="w-4 h-4" />
              Hi Girlies 💕🎀, welcome. 🤗🌸 Anjola_aesthetics_ng is live! 🎉
              <Heart className="w-4 h-4 fill-current" />
              <span className="mx-4">•</span>
              Follow us on TikTok & Instagram for daily updates! ✨
              <span className="mx-4">•</span>
              New stock arrived! Start shopping 🛍️
              <span className="mx-4">•</span>
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

          {/* ADMIN LINKS */}
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setCurrentPage("admin")}
                className={`text-lg font-medium transition ${
                  currentPage === "admin" ? "text-red-600" : "text-red-500 hover:text-red-700"
                }`}
              >
                Products
              </button>

              <button
                onClick={() => setCurrentPage("admin-orders")}
                className={`text-lg font-medium transition ${
                  currentPage === "admin-orders" ? "text-red-600" : "text-red-500 hover:text-red-700"
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

      {/* MOBILE DROPDOWN - Proper Width */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[1000] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl px-6 py-6 space-y-5 z-[1001] md:hidden overflow-y-auto animate-slideInRight">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

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

            {/* ADMIN MOBILE */}
            {user?.role === "admin" && (
              <>
                <div className="border-t pt-4 text-gray-500 text-sm">Admin Panel</div>

                <button
                  onClick={() => {
                    setCurrentPage("admin");
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left text-red-600 font-medium text-lg"
                >
                  📦 Products
                </button>

                <button
                  onClick={() => {
                    setCurrentPage("admin-orders");
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left text-red-600 font-medium text-lg"
                >
                  📋 Orders
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ANIMATION STYLES - iOS COMPATIBLE */}
      <style jsx>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @-webkit-keyframes marquee-scroll {
          0% {
            -webkit-transform: translateX(0);
            transform: translateX(0);
          }
          100% {
            -webkit-transform: translateX(-50%);
            transform: translateX(-50%);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @-webkit-keyframes slideInRight {
          from {
            -webkit-transform: translateX(100%);
            transform: translateX(100%);
          }
          to {
            -webkit-transform: translateX(0);
            transform: translateX(0);
          }
        }
        .animate-marquee-scroll {
          animation: marquee-scroll 25s linear infinite;
          -webkit-animation: marquee-scroll 25s linear infinite;
          will-change: transform;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
          -webkit-animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
import React from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";

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
  return (
    <nav className="bg-white/70 backdrop-blur-2xl fixed top-0 left-0 w-full z-50 shadow-[0_4px_30px_rgba(233,168,199,0.25)] border-b border-[#f6dbea]/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ====================== LOGO + BRAND ====================== */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage("home")}
        >
          <img
            src="/anjola-favicon-v2.png"
            alt="Anjola Logo"
            className="w-11 h-11 rounded-xl object-cover shadow-[0_4px_12px_rgba(233,168,199,0.45)]"
          />

          <div className="leading-tight">
            <div className="text-[20px] font-serif font-semibold text-gray-900 tracking-wide">
              Anjola
            </div>
            <div className="text-[14px] font-serif text-gray-600 -mt-1">
              Aesthetics Ng
            </div>
          </div>
        </div>

        {/* ====================== DESKTOP MENU ====================== */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Home", page: "home" },
            { label: "Shop", page: "shop" },
            { label: "Blog", page: "blog" },
            { label: "Contact", page: "contact" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(item.page)}
              className="text-gray-700 text-lg font-medium tracking-wide hover:text-[#E9A8C7] transition relative group"
            >
              {item.label}

              {/* underline luxury effect */}
              <span className="
                absolute left-0 -bottom-1 w-0 h-[2px] 
                bg-[#E9A8C7] transition-all duration-300 
                group-hover:w-full rounded-full
              "></span>
            </button>
          ))}

          {/* ADMIN OPTIONS */}
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setCurrentPage("admin")}
                className="text-[#d63f5c] font-medium hover:text-[#b72e48] text-lg"
              >
                Products
              </button>

              <button
                onClick={() => setCurrentPage("admin-orders")}
                className="text-[#d63f5c] font-medium hover:text-[#b72e48] text-lg"
              >
                Orders
              </button>
            </>
          )}
        </div>

        {/* ====================== RIGHT ICONS ====================== */}
        <div className="flex items-center gap-6">

          {/* CART ICON */}
          <button
            className="relative hover:scale-110 transition"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="w-7 h-7 text-gray-700 hover:text-[#E9A8C7]" />

            {cart.length > 0 && (
              <span
                className={`
                  absolute -top-2 -right-2 bg-[#E9A8C7] text-white text-xs
                  px-2 py-0.5 rounded-full shadow-md 
                  ${cartBump ? "cart-bump" : ""}
                `}
              >
                {cart.length}
              </span>
            )}
          </button>

          {/* USER ICON */}
          <button onClick={() => setCurrentPage(user ? "profile" : "auth")}>
            <User className="w-7 h-7 text-gray-700 hover:text-[#E9A8C7] transition" />
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

      {/* ====================== MOBILE MENU ====================== */}
      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-xl px-6 py-6 space-y-5 border-t border-[#f0d3e3]">
          {["home", "shop", "blog", "contact"].map((page, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(page);
                setShowMobileMenu(false);
              }}
              className="block w-full text-left text-gray-800 text-lg font-medium py-2 hover:text-[#E9A8C7] transition"
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}

          {user?.role === "admin" && (
            <>
              <div className="border-t pt-4 text-gray-500 text-sm">Admin Panel</div>

              <button
                onClick={() => {
                  setCurrentPage("admin");
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left text-[#d63f5c] font-medium text-lg py-2"
              >
                📦 Products
              </button>

              <button
                onClick={() => {
                  setCurrentPage("admin-orders");
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left text-[#d63f5c] font-medium text-lg py-2"
              >
                📋 Orders
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
import React from "react";
import { ShoppingCart, User, Menu, X, AlertCircle } from "lucide-react";

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

  // CART COUNT BASED ON QUANTITY (not just number of items)
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // CHECK IF CART HAS ANY OUT-OF-STOCK ITEMS
  const cartHasOutOfStock = cart.some((item) => item.quantity > (item.stock || 999999));

  // NAV ITEMS
  const navItems = [
    { label: "Home", page: "home" },
    { label: "Shop", page: "shop" },
    { label: "Blog", page: "blog" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl fixed top-0 left-0 w-full z-50 shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ====================== LOGO ====================== */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage("home")}
        >
          <img
            src="/anjola-favicon-v2.png"
            alt="Anjola Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-sm"
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

        {/* ====================== DESKTOP MENU ====================== */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`relative text-lg font-medium transition 
                ${currentPage === item.page
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

        {/* ====================== RIGHT ICONS ====================== */}
        <div className="flex items-center gap-6">

          {/* CART BUTTON */}
          <button
            className="relative hover:scale-110 transition"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="w-7 h-7 text-gray-700 hover:text-pink-500" />

            {/* CART COUNT BUBBLE */}
            {cartTotalQty > 0 && (
              <span
                className={`absolute -top-2 -right-2 bg-pink-500 text-white text-xs 
                px-2 py-0.5 rounded-full shadow font-semibold
                ${cartBump ? "cart-bump" : ""}`}
              >
                {cartTotalQty}
              </span>
            )}

            {/* OUT-OF-STOCK WARNING DOT */}
            {cartHasOutOfStock && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border border-white rounded-full"></span>
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

      {/* ====================== MOBILE MENU ====================== */}
      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-lg px-6 py-6 space-y-5 border-t">
          
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => {
                setCurrentPage(item.page);
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left text-lg py-2 font-medium ${
                currentPage === item.page
                  ? "text-pink-600"
                  : "text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* ADMIN MOBILE */}
          {user?.role === "admin" && (
            <>
              <div className="border-t pt-4 text-gray-500 text-sm">
                Admin Panel
              </div>

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
      )}
    </nav>
  );
};

export default Navigation;
import React from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

const Navigation = ({
  currentPage,
  setCurrentPage,
  cart,
  showCart,
  setShowCart,
  showMobileMenu,
  setShowMobileMenu,
  user,
  cartBump
}) => {
  return (
    <nav className="bg-white/80 backdrop-blur-xl fixed top-0 left-0 w-full z-50 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 
            flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-105 transition">
            A
          </div>
          <span className="text-2xl font-serif font-semibold text-gray-900 tracking-wide">
            Anjola Aesthetics Ng
          </span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Home', page: 'home' },
            { label: 'Shop', page: 'shop' },
            { label: 'Blog', page: 'blog' },
            { label: 'Contact', page: 'contact' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(item.page)}
              className="text-gray-700 text-lg font-medium hover:text-pink-500 transition relative group"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-pink-500 transition-all group-hover:w-full" />
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setCurrentPage('admin')}
                className="text-red-600 font-medium hover:text-red-700 text-lg"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('admin-orders')}
                className="text-red-600 font-medium hover:text-red-700 text-lg"
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
            {cart.length > 0 && (
              <span
                className={`
                  absolute -top-2 -right-2 bg-pink-500 text-white text-xs
                  px-2 py-0.5 rounded-full shadow
                  ${cartBump ? 'cart-bump' : ''}
                `}
              >
                {cart.length}
              </span>
            )}
          </button>

          {/* USER */}
          <button onClick={() => setCurrentPage(user ? 'profile' : 'auth')}>
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

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-lg px-6 py-6 space-y-5">
          {['home', 'shop', 'blog', 'contact'].map((page, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(page);
                setShowMobileMenu(false);
              }}
              className="block w-full text-left text-gray-800 text-lg font-medium py-1"
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="border-t pt-4 text-gray-500 text-sm">
                Admin Panel
              </div>
              <button
                onClick={() => {
                  setCurrentPage('admin');
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left text-red-600 font-medium text-lg"
              >
                📦 Products
              </button>
              <button
                onClick={() => {
                  setCurrentPage('admin-orders');
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
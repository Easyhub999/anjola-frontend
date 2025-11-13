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
  user 
}) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-serif text-gray-800">Anjola Aesthetics</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="text-gray-700 hover:text-pink-400 transition"
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('shop')} 
              className="text-gray-700 hover:text-pink-400 transition"
            >
              Shop
            </button>
            <button 
              onClick={() => setCurrentPage('blog')} 
              className="text-gray-700 hover:text-pink-400 transition"
            >
              Blog
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              className="text-gray-700 hover:text-pink-400 transition"
            >
              Contact
            </button>
            
            {/* Admin Menu - Shows both Products and Orders */}
            {user?.role === 'admin' && (
              <>
                <button 
                  onClick={() => setCurrentPage('admin')} 
                  className={`transition ${
                    currentPage === 'admin' 
                      ? 'text-purple-700 font-semibold' 
                      : 'text-purple-600 hover:text-purple-800'
                  }`}
                >
                  Products
                </button>
                <button 
                  onClick={() => setCurrentPage('admin-orders')} 
                  className={`transition ${
                    currentPage === 'admin-orders' 
                      ? 'text-purple-700 font-semibold' 
                      : 'text-purple-600 hover:text-purple-800'
                  }`}
                >
                  Orders
                </button>
              </>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="relative" onClick={() => setShowCart(!showCart)}>
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-pink-400 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => setCurrentPage(user ? 'profile' : 'auth')}>
              <User className="w-6 h-6 text-gray-700 hover:text-pink-400 transition" />
            </button>
            <button 
              className="md:hidden" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <button 
              onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }} 
              className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded"
            >
              Home
            </button>
            <button 
              onClick={() => { setCurrentPage('shop'); setShowMobileMenu(false); }} 
              className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded"
            >
              Shop
            </button>
            <button 
              onClick={() => { setCurrentPage('blog'); setShowMobileMenu(false); }} 
              className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded"
            >
              Blog
            </button>
            <button 
              onClick={() => { setCurrentPage('contact'); setShowMobileMenu(false); }} 
              className="block w-full text-left px-4 py-2 hover:bg-pink-50 rounded"
            >
              Contact
            </button>
            
            {/* Admin Mobile Menu */}
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Admin Panel
                </div>
                <button 
                  onClick={() => { setCurrentPage('admin'); setShowMobileMenu(false); }} 
                  className="block w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-600 rounded"
                >
                  📦 Products
                </button>
                <button 
                  onClick={() => { setCurrentPage('admin-orders'); setShowMobileMenu(false); }} 
                  className="block w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-600 rounded"
                >
                  📋 Orders
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
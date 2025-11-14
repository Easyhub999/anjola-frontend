import React from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import './navigation.css';

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
    <nav>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-brand" onClick={() => setCurrentPage('home')}>
            <div className="nav-logo">
              <span>A</span>
            </div>
            <span className="nav-title">Anjola Aesthetics</span>
          </div>

          {/* Desktop Menu */}
          <div className="nav-menu desktop">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="nav-link"
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('shop')} 
              className="nav-link"
            >
              Shop
            </button>
            <button 
              onClick={() => setCurrentPage('blog')} 
              className="nav-link"
            >
              Blog
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              className="nav-link"
            >
              Contact
            </button>
            
            {/* Admin Menu */}
            {user?.role === 'admin' && (
              <>
                <button 
                  onClick={() => setCurrentPage('admin')} 
                  className={`nav-link admin ${currentPage === 'admin' ? 'active' : ''}`}
                >
                  Products
                </button>
                <button 
                  onClick={() => setCurrentPage('admin-orders')} 
                  className={`nav-link admin ${currentPage === 'admin-orders' ? 'active' : ''}`}
                >
                  Orders
                </button>
              </>
            )}
          </div>

          {/* Icons */}
          <div className="nav-icons">
            <button className="nav-icon-btn" onClick={() => setShowCart(!showCart)}>
              <ShoppingCart />
              {cart.length > 0 && (
                <span className="cart-badge">
                  {cart.length}
                </span>
              )}
            </button>
            <button className="nav-icon-btn" onClick={() => setCurrentPage(user ? 'profile' : 'auth')}>
              <User />
            </button>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu open">
            <button 
              onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }} 
              className="mobile-menu-item"
            >
              Home
            </button>
            <button 
              onClick={() => { setCurrentPage('shop'); setShowMobileMenu(false); }} 
              className="mobile-menu-item"
            >
              Shop
            </button>
            <button 
              onClick={() => { setCurrentPage('blog'); setShowMobileMenu(false); }} 
              className="mobile-menu-item"
            >
              Blog
            </button>
            <button 
              onClick={() => { setCurrentPage('contact'); setShowMobileMenu(false); }} 
              className="mobile-menu-item"
            >
              Contact
            </button>
            
            {/* Admin Mobile Menu */}
            {user?.role === 'admin' && (
              <>
                <div className="mobile-menu-divider"></div>
                <div className="mobile-menu-label">
                  Admin Panel
                </div>
                <button 
                  onClick={() => { setCurrentPage('admin'); setShowMobileMenu(false); }} 
                  className="mobile-menu-item admin"
                >
                  📦 Products
                </button>
                <button 
                  onClick={() => { setCurrentPage('admin-orders'); setShowMobileMenu(false); }} 
                  className="mobile-menu-item admin"
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
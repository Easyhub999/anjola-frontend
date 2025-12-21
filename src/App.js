import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import Navigation from './components/Navigation';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

import { productsAPI } from './api';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  /* 🔥 GLOBAL ERROR CATCHER (CORRECT PLACE) */
  useEffect(() => {
    window.onerror = function (message, source, lineno, colno, error) {
      console.log('🔥 GLOBAL ERROR CAUGHT');
      console.log({ message, source, lineno, colno, error });
    };

    return () => {
      window.onerror = null;
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [cartBump, setCartBump] = useState(false);

  const currentPage = location.pathname.slice(1) || 'home';

  const setCurrentPage = (page) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedCart = localStorage.getItem('cart');

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedCart) setCart(JSON.parse(storedCart));

      const savedProduct = localStorage.getItem('selectedProduct');
      if (location.pathname === '/product' && savedProduct && !selectedProduct) {
        setSelectedProduct(JSON.parse(savedProduct));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    }
  }, [selectedProduct]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getTotalPrice = () =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0);

  if (loading) {
    return (
      <>
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} cart={cart} />
        <LoadingSpinner />
      </>
    );
  }

  if (error && products.length === 0) {
    return (
      <>
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} cart={cart} />
        <ErrorDisplay message={error} />
      </>
    );
  }

  return (
    <div className="App">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} cart={cart} />

      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        getTotalPrice={getTotalPrice}
        setCurrentPage={setCurrentPage}
      />

      <div className={currentPage !== 'home' ? 'pt-40' : ''}>
        <Routes>
          <Route path="/" element={<HomePage products={products} cart={cart} />} />
          <Route path="/shop" element={<ShopPage products={products} cart={cart} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} getTotalPrice={getTotalPrice} />} />
          <Route path="/checkout-complete" element={<OrderSuccessPage />} />
          <Route path="/admin" element={<AdminPage user={user} products={products} />} />
          <Route path="/admin-orders" element={<AdminOrdersPage user={user} />} />
          <Route path="/admin-analytics" element={<AdminAnalyticsPage user={user} />} />
        </Routes>
      </div>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
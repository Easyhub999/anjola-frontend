import React, { useState, useEffect } from 'react';
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
import { productsAPI } from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // UI sugar
  const [toast, setToast] = useState(null);
  const [cartBump, setCartBump] = useState(false);

  // Load user & cart from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCart = localStorage.getItem('cart');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart data');
      }
    }
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsAPI.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Make sure backend is running.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Helper to trigger toast + cart bump
  const triggerCartFeedback = (productName) => {
    setToast({
      id: Date.now(),
      message: `“${productName}” added to cart ✓`
    });

    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);

    // hide toast after 2.5s
    setTimeout(() => {
      setToast((current) =>
        current && current.id ? null : current
      );
    }, 2500);
  };

  // Cart functions
  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    // ✅ no more auto-opening sidebar
    triggerCartFeedback(product.name);
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item =>
      item._id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cart={cart}
          showCart={showCart}
          setShowCart={setShowCart}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          user={user}
          cartBump={cartBump}
        />
        <LoadingSpinner />
      </>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <>
        <Navigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cart={cart}
          showCart={showCart}
          setShowCart={setShowCart}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          user={user}
          cartBump={cartBump}
        />
        <ErrorDisplay message={error} />
      </>
    );
  }

  return (
    <div className="App">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        user={user}
        cartBump={cartBump}
      />

      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        setCurrentPage={setCurrentPage}
      />

      {currentPage === 'home' && (
        <HomePage
          products={products}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'shop' && (
        <ShopPage
          products={products}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {currentPage === 'blog' && <BlogPage />}

      {currentPage === 'contact' && <ContactPage />}

      {currentPage === 'auth' && (
        <AuthPage
          setUser={setUser}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'profile' && user && (
        <ProfilePage
          user={user}
          setUser={setUser}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          cart={cart}
          getTotalPrice={getTotalPrice}
          clearCart={clearCart}
          setCurrentPage={setCurrentPage}
          user={user}
        />
      )}

      {currentPage === 'admin' && (
        <AdminPage
          user={user}
          products={products}
          setProducts={setProducts}
        />
      )}

      {currentPage === 'admin-orders' && (
        <AdminOrdersPage user={user} />
      )}

      {/* Toast / mini bubble near cart */}
      {toast && (
        <div className="
          fixed top-20 right-4 sm:right-8 
          bg-gray-900 text-white text-sm md:text-base
          px-4 py-3 rounded-2xl shadow-xl
          animate-fade-in-up
          flex items-center gap-2 z-[60]
        ">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
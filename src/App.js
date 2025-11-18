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
import ProductDetailPage from './pages/ProductDetailPage';

function App() {

  const [currentPage, setCurrentPage] = useState('home');
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

  // Load from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCart = localStorage.getItem('cart');

    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }

    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch {}
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Toast animation
  const triggerCartFeedback = (productName) => {
    setToast({
      id: Date.now(),
      message: `“${productName}” added to cart ✓`
    });

    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);

    setTimeout(() => setToast(null), 2500);
  };

  // Cart functions
  const addToCart = (product) => {
    const exists = cart.find(item => item._id === product._id);

    if (exists) {
      setCart(
        cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    triggerCartFeedback(product.name);
  };

  const updateQuantity = (id, change) => {
    setCart(
      cart.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const getTotalPrice = () =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const clearCart = () => setCart([]);

  // Loading
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

  // Error
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

      {/* HOME */}
      {currentPage === 'home' && (
        <HomePage
          products={products}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          setCurrentPage={setCurrentPage}
          setSelectedProduct={setSelectedProduct}
        />
      )}

      {/* SHOP — UPDATED WITH NEW PROPS */}
      {currentPage === 'shop' && (
        <ShopPage
          products={products}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
          setSelectedProduct={setSelectedProduct}
          selectedProduct={selectedProduct}
        />
      )}

      {/* PRODUCT DETAILS PAGE */}
      {currentPage === 'product-details' && selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          addToCart={addToCart}
          user={user}
          setCurrentPage={setCurrentPage}
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

      {/* Toast UI */}
      {toast && (
        <div
          className="
            fixed top-20 right-4 sm:right-8
            bg-gray-900 text-white text-sm
            px-4 py-3 rounded-2xl shadow-xl
            animate-fade-in-up flex items-center
            gap-2 z-[60]
          "
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      <Footer setCurrentPage={setCurrentPage} />

    </div>
  );
}

export default App;
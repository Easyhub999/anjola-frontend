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
import { productsAPI } from './api';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

// Wrapper component to handle navigation
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Get current page from URL
  const currentPage = location.pathname.slice(1) || 'home';

  // Custom setCurrentPage that uses navigate
  const setCurrentPage = (page) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  // ======================================================
// LOAD USER & CART FROM LOCALSTORAGE (ONE-TIME ONLY)
// ======================================================
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedCart = localStorage.getItem('cart');

  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      // ignore bad JSON
    }
  }

  if (storedCart) {
    try {
      setCart(JSON.parse(storedCart));
    } catch {
      // ignore bad JSON
    }
  }

  // ONLY restore selected product on INITIAL page load (not on every navigation)
  const savedProduct = localStorage.getItem('selectedProduct');
  if (location.pathname === '/product' && savedProduct && !selectedProduct) {
    try {
      setSelectedProduct(JSON.parse(savedProduct));
    } catch {
      // ignore
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Empty dependency array - runs ONCE on mount

// ======================================================
// SAVE SELECTED PRODUCT TO LOCALSTORAGE
// ======================================================
useEffect(() => {
  if (selectedProduct) {
    localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
  }
}, [selectedProduct]); // ✅ Save whenever selectedProduct changes

  // ======================================================
  // LOAD PRODUCTS FROM BACKEND
  // ======================================================
  useEffect(() => {
    const loadProducts = async () => {
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
    };

    loadProducts();
  }, []);

  // ======================================================
  // SAVE CART
  // ======================================================
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ======================================================
  // TOAST & CART FEEDBACK
  // ======================================================
  const triggerCartFeedback = (message) => {
    const id = Date.now();
    setToast({ id, message });

    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);
    setTimeout(() => setToast(null), 2500);
  };

  // ======================================================
  // CART FUNCTIONS
  // ======================================================
  const addToCart = (product) => {
    if (product.visible === false) {
      triggerCartFeedback('This product is currently unavailable.');
      return;
    }

    if (typeof product.quantity === 'number' && product.quantity <= 0) {
      triggerCartFeedback('This product is out of stock.');
      return;
    }

    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    triggerCartFeedback(`"${product.name}" added to cart ✓`);
  };

  const updateQuantity = (id, change) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const getTotalPrice = () =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const clearCart = () => setCart([]);

  // ======================================================
  // LOADING + ERROR UI
  // ======================================================
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

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="App">
      {/* TOP NAV */}
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

      {/* CART SIDEBAR */}
      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        setCurrentPage={setCurrentPage}
      />

      {/* ROUTES */}
      <div className={currentPage !== 'home' ? 'pt-40' : ''}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                cart={cart}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                setCurrentPage={setCurrentPage}
                setSelectedProduct={setSelectedProduct}
              />
            }
          />

          <Route
            path="/shop"
            element={
              <ShopPage
                products={products}
                cart={cart}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                setSelectedProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
              />
            }
          />

          <Route
            path="/product"
            element={
              selectedProduct ? (
                <ProductDetailPage
                  selectedProduct={selectedProduct}
                  addToCart={addToCart}
                  user={user}
                  setCurrentPage={setCurrentPage}
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-gray-600">No product selected</p>
                </div>
              )
            }
          />

          <Route path="/blog" element={<BlogPage />} />
          
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/auth"
            element={<AuthPage setUser={setUser} setCurrentPage={setCurrentPage} />}
          />

          <Route
            path="/profile"
            element={
              user ? (
                <ProfilePage
                  user={user}
                  setUser={setUser}
                  setCurrentPage={setCurrentPage}
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-gray-600">Please log in to view your profile</p>
                </div>
              )
            }
          />

          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cart={cart}
                getTotalPrice={getTotalPrice}
                clearCart={clearCart}
                setCurrentPage={setCurrentPage}
                user={user}
              />
            }
          />

          <Route
            path="/admin"
            element={
              <AdminPage
                user={user}
                products={products}
                setProducts={setProducts}
              />
            }
          />

          <Route
            path="/admin-analytics"
            element={
              <AdminAnalyticsPage user={user} />
            }
          />

          <Route
            path="/admin-orders"
            element={<AdminOrdersPage user={user} />}
          />

          <Route
            path="/payment-success"
            element={
              <PaymentSuccessPage
                setCurrentPage={setCurrentPage}
                clearCart={clearCart}
              />
            }
          />
        </Routes>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-20 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-2xl shadow-xl animate-fade-in-up z-[1000]">
          <span>{toast.message}</span>
        </div>
      )}

      {/* FOOTER */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// Main App component wraps everything in Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
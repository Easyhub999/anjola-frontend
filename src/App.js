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
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { productsAPI } from './api';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

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

  const currentPage = location.pathname.slice(1) || 'home';

  const setCurrentPage = function(page) {
    if (page === 'home') {
      navigate('/');
    } else {
      navigate('/' + page);
    }
  };

  useEffect(function() {
    var storedUser = localStorage.getItem('user');
    var storedCart = localStorage.getItem('cart');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }

    var savedProduct = localStorage.getItem('selectedProduct');
    if (location.pathname === '/product' && savedProduct && !selectedProduct) {
      try {
        setSelectedProduct(JSON.parse(savedProduct));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(function() {
    if (selectedProduct) {
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    }
  }, [selectedProduct]);

  useEffect(function() {
    var loadProducts = async function() {
      try {
        setLoading(true);
        var data = await productsAPI.getAllProducts();
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

  useEffect(function() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  var triggerCartFeedback = function(message) {
    var id = Date.now();
    setToast({ id: id, message: message });
    setCartBump(true);
    setTimeout(function() { setCartBump(false); }, 300);
    setTimeout(function() { setToast(null); }, 2500);
  };

  var addToCart = function(product) {
    if (product.visible === false) {
      triggerCartFeedback('This product is currently unavailable.');
      return;
    }

    if (typeof product.quantity === 'number' && product.quantity <= 0) {
      triggerCartFeedback('This product is out of stock.');
      return;
    }

    var exists = cart.find(function(item) { return item._id === product._id; });

    if (exists) {
      setCart(
        cart.map(function(item) {
          if (item._id === product._id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        })
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    triggerCartFeedback(product.name + ' added to cart');
  };

  var updateQuantity = function(id, change) {
    setCart(
      cart.map(function(item) {
        if (item._id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + change) };
        }
        return item;
      })
    );
  };

  var removeFromCart = function(id) {
    setCart(cart.filter(function(item) { return item._id !== id; }));
  };

  var getTotalPrice = function() {
    return cart.reduce(function(t, i) { return t + i.price * i.quantity; }, 0);
  };

  var clearCart = function() { setCart([]); };

  if (loading) {
    return (
      <div>
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
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div>
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
      </div>
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
                <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <p style={{color: '#666'}}>No product selected</p>
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
                <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <p style={{color: '#666'}}>Please log in to view your profile</p>
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

          <Route path="/payment-success" element={<ContactPage />} />

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
            element={<AdminAnalyticsPage user={user} />}
          />

          <Route
            path="/admin-orders"
            element={<AdminOrdersPage user={user} />}
          />
        </Routes>
      </div>

      {toast && (
        <div style={{position: 'fixed', top: '80px', right: '16px', backgroundColor: '#111', color: 'white', fontSize: '14px', padding: '12px 16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 1000}}>
          <span>{toast.message}</span>
        </div>
      )}

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
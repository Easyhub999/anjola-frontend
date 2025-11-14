import React, { useState, useEffect } from 'react';
import './styles.css'; // ADD THIS LINE - Import all component styles
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

  // Load user from localStorage on mount
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
        setError('Failed to load products. Make sure backend is running on http://localhost:5000');
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

  // Cart functions
  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item =>
      item._id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Main render with error/loading states
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
        />
        <ErrorDisplay message={error} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        user={user}
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
          addToCart={addToCart}
          setCurrentPage={setCurrentPage}
        />
      )}
      
      {currentPage === 'shop' && (
        <ShopPage 
          products={products}
          addToCart={addToCart}
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
        <AdminOrdersPage 
          user={user}
        />
      )}
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
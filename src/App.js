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
import ProductDetailPage from './pages/ProductDetailPage';
import { productsAPI } from './api';

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

  // ======================================================
  // 🔥 1. Load user, cart, AND last page from localStorage
  // ======================================================
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCart = localStorage.getItem('cart');
    const savedPage = localStorage.getItem('currentPage');
    const savedProduct = localStorage.getItem('selectedProduct');

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

    // restore page
    if (savedPage) setCurrentPage(savedPage);

    // restore selected product ONLY if user was on product page
    if (savedPage === 'product' && savedProduct) {
      try {
        setSelectedProduct(JSON.parse(savedProduct));
      } catch {
        // ignore
      }
    }
  }, []);

  // ======================================================
  // 🔥 2. Save currentPage + selectedProduct to localStorage
  // ======================================================
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);

    if (currentPage === 'product' && selectedProduct) {
      localStorage.setItem(
        'selectedProduct',
        JSON.stringify(selectedProduct)
      );
    }
  }, [currentPage, selectedProduct]);

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
    // Extra safety: respect visibility + stock
    if (product.visible === false) {
      triggerCartFeedback('This product is currently unavailable.');
      return;
    }

    if (
      typeof product.quantity === 'number' &&
      product.quantity <= 0
    ) {
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
    <div className="App page-container">
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

      {/* PAGES - All pages except HomePage need top padding */}
      <div className={currentPage !== 'home' ? 'pt-[115px]' : ''}>
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

        {currentPage === 'shop' && (
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
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetailPage
            selectedProduct={selectedProduct}
            addToCart={addToCart}
            user={user}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'blog' && <BlogPage />}
        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'auth' && (
          <AuthPage setUser={setUser} setCurrentPage={setCurrentPage} />
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
      </div>

      {/* TOAST - Now above everything */}
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

export default App;
import { useState, useEffect } from 'react';
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
import { Analytics } from "@vercel/analytics/react";
import { MessageCircle, ArrowUp } from 'lucide-react';
import MobileBottomNav from './components/MobileBottomNav';
import CustomCursor from './components/CustomCursor';
import Confetti from './components/Confetti';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScrollProgress from './components/ScrollProgress';

// ============================================
// FLOATING ACTION BUTTONS COMPONENT
// ============================================
const FloatingButtons = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[798] flex flex-col gap-3">
      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-luxury flex items-center justify-center
            hover:shadow-luxury-lg hover:scale-105 transition-all duration-300 animate-fadeInUp border border-gray-100"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* WhatsApp */}
      <a
        href="https://wa.me/2347065943625?text=Hi%20Anjola%20Aesthetics!%20I%27d%20like%20to%20enquire%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center
          hover:bg-emerald-600 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeInUp"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};

// ============================================
// TOAST COMPONENT
// ============================================
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-4 z-[1100] animate-slideInRight">
      <div className="bg-gray-900 text-white text-sm px-5 py-3.5 rounded-xl shadow-luxury-lg flex items-center gap-3 max-w-xs">
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
};

// ============================================
// RECENTLY VIEWED HOOK
// ============================================
const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try { setRecentlyViewed(JSON.parse(stored)); } catch (e) { /* ignore */ }
    }
  }, []);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p._id !== product._id);
      const updated = [product, ...filtered].slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  return { recentlyViewed, addToRecentlyViewed };
};

// ============================================
// WISHLIST HOOK
// ============================================
const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try { setWishlist(JSON.parse(stored)); } catch (e) { /* ignore */ }
    }
  }, []);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      const updated = exists
        ? prev.filter(p => p._id !== product._id)
        : [...prev, product];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (id) => wishlist.some(p => p._id === id);

  return { wishlist, toggleWishlist, isWishlisted };
};

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
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [pageTransition, setPageTransition] = useState(false);

  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();

  const currentPage = location.pathname.slice(1) || 'home';

  const setCurrentPage = function(page) {
    setPageTransition(true);
    setTimeout(() => {
      if (page === 'home') {
        navigate('/');
      } else {
        navigate('/' + page);
      }
      setTimeout(() => setPageTransition(false), 50);
    }, 200);
  };

  // Dynamic page titles
  useEffect(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const titles = {
      home: 'Anjola Aesthetics Ng — Luxury Self-Care',
      shop: 'Shop | Anjola Aesthetics',
      product: selectedProduct ? `${selectedProduct.name} | Anjola Aesthetics` : 'Product | Anjola Aesthetics',
      blog: 'Blog | Anjola Aesthetics',
      contact: 'Contact | Anjola Aesthetics',
      auth: 'Sign In | Anjola Aesthetics',
      profile: 'My Account | Anjola Aesthetics',
      checkout: `Checkout${cartCount > 0 ? ` (${cartCount})` : ''} | Anjola Aesthetics`,
      admin: 'Admin | Anjola Aesthetics',
      'admin-analytics': 'Analytics | Anjola Aesthetics',
      'admin-orders': 'Orders | Anjola Aesthetics',
    };
    document.title = titles[currentPage] || 'Anjola Aesthetics Ng';
  }, [currentPage, cart, selectedProduct]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowMobileMenu(false);
    navigate('/');
  };

  useEffect(function() {
    var storedUser = localStorage.getItem('user');
    var storedCart = localStorage.getItem('cart');

    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) { console.error(e); }
    }

    var savedProduct = localStorage.getItem('selectedProduct');
    if (location.pathname === '/product' && savedProduct && !selectedProduct) {
      try { setSelectedProduct(JSON.parse(savedProduct)); } catch (e) { console.error(e); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(function() {
    if (selectedProduct) {
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
      addToRecentlyViewed(selectedProduct);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setToast(message);
    setCartBump(true);
    setTimeout(function() { setCartBump(false); }, 300);
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

    var effectivePrice = product.salesPrice && product.salesPrice < product.price
      ? product.salesPrice
      : product.price;

    var cartProduct = {
      ...product,
      price: effectivePrice,
      originalPrice: product.price,
      onSale: product.salesPrice && product.salesPrice < product.price
    };

    var cartKey = product.selectedPieces
      ? product._id + '-' + product.selectedPieces
      : product._id;

    var exists = cart.find(function(item) {
      var itemKey = item.selectedPieces
        ? item._id + '-' + item.selectedPieces
        : item._id;
      return itemKey === cartKey;
    });

    if (exists) {
      setCart(
        cart.map(function(item) {
          var itemKey = item.selectedPieces
            ? item._id + '-' + item.selectedPieces
            : item._id;
          if (itemKey === cartKey) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        })
      );
    } else {
      setCart([...cart, { ...cartProduct, quantity: 1 }]);
    }

    var piecesText = product.selectedPieces && product.selectedPieces > 1
      ? ' (' + product.selectedPieces + ' pieces)'
      : '';

    triggerCartFeedback(product.name + piecesText + ' added to cart');
    setConfettiTrigger(Date.now());
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
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          cart={cart} showCart={showCart} setShowCart={setShowCart}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
          user={user} cartBump={cartBump} handleLogout={handleLogout}
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div>
        <Navigation
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          cart={cart} showCart={showCart} setShowCart={setShowCart}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
          user={user} cartBump={cartBump} handleLogout={handleLogout}
        />
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <div className="App bg-[#fff7f9] min-h-screen has-bottom-nav">
      <CustomCursor />
      <Confetti trigger={confettiTrigger} />
      <ScrollProgress />
      <PWAInstallPrompt />

      <Navigation
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        cart={cart} showCart={showCart} setShowCart={setShowCart}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        user={user} cartBump={cartBump} handleLogout={handleLogout}
      />

      <CartSidebar
        showCart={showCart} setShowCart={setShowCart}
        cart={cart} updateQuantity={updateQuantity}
        removeFromCart={removeFromCart} getTotalPrice={getTotalPrice}
        setCurrentPage={setCurrentPage}
      />

      <div className={`${currentPage === 'shop' ? 'pt-36' : 'pt-24'} transition-opacity duration-200 ${pageTransition ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
        style={{ transition: 'opacity 0.2s ease, transform 0.2s ease' }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products} cart={cart} addToCart={addToCart}
                updateQuantity={updateQuantity} setCurrentPage={setCurrentPage}
                setSelectedProduct={setSelectedProduct}
              />
            }
          />

          <Route
            path="/shop"
            element={
              <ShopPage
                products={products} cart={cart} addToCart={addToCart}
                updateQuantity={updateQuantity} removeFromCart={removeFromCart}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
                wishlist={wishlist} toggleWishlist={toggleWishlist} isWishlisted={isWishlisted}
                recentlyViewed={recentlyViewed}
              />
            }
          />

          <Route
            path="/product"
            element={
              selectedProduct ? (
                <ProductDetailPage
                  selectedProduct={selectedProduct} addToCart={addToCart}
                  user={user} setCurrentPage={setCurrentPage}
                  toggleWishlist={toggleWishlist} isWishlisted={isWishlisted}
                  products={products} setSelectedProduct={setSelectedProduct}
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
          <Route path="/auth" element={<AuthPage setUser={setUser} setCurrentPage={setCurrentPage} />} />

          <Route
            path="/profile"
            element={
              user ? (
                <ProfilePage
                  user={user} setUser={setUser} setCurrentPage={setCurrentPage}
                  wishlist={wishlist} toggleWishlist={toggleWishlist}
                  setSelectedProduct={setSelectedProduct}
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
                cart={cart} getTotalPrice={getTotalPrice}
                clearCart={clearCart} setCurrentPage={setCurrentPage} user={user}
              />
            }
          />

          <Route path="/admin-analytics" element={<AdminAnalyticsPage user={user} />} />
          <Route path="/admin-orders" element={<AdminOrdersPage user={user} />} />
          <Route
            path="/admin"
            element={<AdminPage user={user} products={products} setProducts={setProducts} />}
          />
        </Routes>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}

      {/* Floating Action Buttons */}
      <FloatingButtons />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        cart={cart} setShowCart={setShowCart} user={user}
      />

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Analytics />
    </Router>
  );
}

export default App;

import { applyPageMetadata, pageMetadata } from './siteMetadata';
import { addCartItem, changeCartQuantity, removeCartItem, restoreCart } from './cart';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import ProductRoute from './pages/ProductRoute';
import { productPath } from './productLinks';
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
    <div className="anjola-floating-actions fixed right-4 md:right-6 z-[798] flex flex-col gap-3">
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

function LegacyProductRedirect() {
  let product;
  try { product = JSON.parse(localStorage.getItem('selectedProduct')); } catch { /* ignore unavailable storage */ }
  return /^[a-f\d]{24}$/i.test(product?._id || '')
    ? <Navigate to={productPath(product)} replace />
    : <main className="pd-empty"><h1>Find your next everyday favourite.</h1><p>Choose an item from the collection to see its details.</p><a href="/shop">Explore the collection</a></main>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try { return restoreCart(JSON.parse(localStorage.getItem('cart') || '[]')); }
    catch { return []; }
  });
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

  const isProductRoute = location.pathname.startsWith('/product/');
  const productId = location.pathname.split('/')[2] || '';
  const currentPage = isProductRoute ? 'product' : location.pathname.slice(1) || 'home';

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

  useEffect(() => {
    if (!isProductRoute) applyPageMetadata(pageMetadata(location.pathname, selectedProduct));
  }, [location.pathname, selectedProduct, isProductRoute]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowMobileMenu(false);
    navigate('/');
  };

  useEffect(function() {
    var storedUser = localStorage.getItem('user');


    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }


  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(function() {
    if (selectedProduct) {
      // Legacy /product bookmarks can recover the last viewed item.
      try { localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct)); } catch { /* storage may be unavailable */ }
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

    var requiresOptions = (product.sizes?.length > 0 && !product.selectedSize)
      || (product.colors?.length > 0 && !product.selectedColor)
      || (product.priceVariations?.length > 0 && !product.selectedPieces);
    if (requiresOptions) {
      setSelectedProduct(product);
      setCurrentPage(productPath(product).slice(1));
      triggerCartFeedback('Please select the product options before adding to cart.');
      return false;
    }

    var hasSelectedPack = product.priceVariations?.length > 0 && product.selectedPieces;
    var effectivePrice = !hasSelectedPack && product.salesPrice != null && product.salesPrice < product.price
      ? product.salesPrice
      : product.price;

    var cartProduct = {
      ...product,
      price: effectivePrice,
      originalPrice: product.price,
      onSale: !hasSelectedPack && product.salesPrice != null && product.salesPrice < product.price
    };

    setCart(previous => addCartItem(previous, cartProduct));

    var piecesText = product.selectedPieces && product.selectedPieces > 1
      ? ' (' + product.selectedPieces + ' pieces)'
      : '';

    triggerCartFeedback(product.name + piecesText + ' added to cart');
    setConfettiTrigger(Date.now());
  };

  var updateQuantity = function(key, change) {
    setCart(previous => changeCartQuantity(previous, key, change));
  };

  var removeFromCart = function(key) {
    setCart(previous => removeCartItem(previous, key));
  };

  var getTotalPrice = function() {
    return cart.reduce(function(t, i) { return t + i.price * i.quantity; }, 0);
  };

  const clearCart = useCallback(() => { setCart([]); }, []);

  if (loading && currentPage !== 'product') {
    return (
      <div>
        <Navigation
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          cart={cart} showCart={showCart} setShowCart={setShowCart}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
          user={user} cartBump={cartBump} handleLogout={handleLogout}
        />
        <div className="anjola-page-content"><LoadingSpinner /></div>
      </div>
    );
  }

  if (error && products.length === 0 && currentPage !== 'product') {
    return (
      <div>
        <Navigation
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          cart={cart} showCart={showCart} setShowCart={setShowCart}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
          user={user} cartBump={cartBump} handleLogout={handleLogout}
        />
        <div className="anjola-page-content"><ErrorDisplay message={error} /></div>
      </div>
    );
  }

  return (
    <div className="App bg-[#fff7f9] min-h-screen">
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

      <div className={`anjola-page-content transition-opacity duration-200 ${pageTransition ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
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
                clearCart={clearCart} wishlist={wishlist} toggleWishlist={toggleWishlist} isWishlisted={isWishlisted}
                recentlyViewed={recentlyViewed}
              />
            }
          />

          <Route path="/product/:id" element={
            <ProductRoute productId={productId} onResolved={setSelectedProduct}
              addToCart={addToCart} user={user} setCurrentPage={setCurrentPage}
              toggleWishlist={toggleWishlist} isWishlisted={isWishlisted}
              products={products} setSelectedProduct={setSelectedProduct} />
          } />
          <Route path="/product" element={<LegacyProductRedirect />} />

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

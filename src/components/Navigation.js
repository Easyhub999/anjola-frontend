// src/components/Navigation.js
import React, { useEffect, useRef } from "react";
import { ShoppingCart, User, Menu, X, Sparkles, Heart } from "lucide-react";

const Navigation = ({
  currentPage,
  setCurrentPage,
  cart,
  showCart,
  setShowCart,
  showMobileMenu,
  setShowMobileMenu,
  user,
  cartBump,
}) => {
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= marquee.scrollWidth / 3) {
        scrollAmount = 0;
      }
      marquee.style.transform = `translateX(-${scrollAmount}px)`;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-[999] bg-white/80 backdrop-blur-lg shadow-sm">
      {/* MARQUEE */}
      <div className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white overflow-hidden py-3">
        <div ref={marqueeRef} className="flex whitespace-nowrap">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-semibold mx-8">
              <Sparkles className="w-4 h-4" />
              Hi Girlies, welcome to Anjola Aesthetics!
              <Heart className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* NAV BAR */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage("home")}
        >
          <img src="/anjola-favicon-v2.png" alt="Logo" className="w-10 h-10 rounded-xl" />
          <div>
            <div className="text-lg font-semibold">Anjola</div>
            <div className="text-sm text-gray-600">Aesthetics NG</div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8">
          {["home", "shop", "blog", "contact"].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "text-pink-600" : "text-gray-700"}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}

          {user?.role === "admin" && (
            <>
              <button onClick={() => setCurrentPage("admin")}>Products</button>
              <button onClick={() => setCurrentPage("admin-orders")}>Orders</button>
            </>
          )}
        </div>

        {/* ICONS */}
        <div className="flex gap-4">
          <button onClick={() => setShowCart(!showCart)}>
            <ShoppingCart />
            {cartTotalQty > 0 && <span>{cartTotalQty}</span>}
          </button>

          <button onClick={() => setCurrentPage(user ? "profile" : "auth")}>
            <User />
          </button>

          <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
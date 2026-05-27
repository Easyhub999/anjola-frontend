import { Home, ShoppingBag, ShoppingCart, User, Heart } from 'lucide-react';

const MobileBottomNav = ({ currentPage, setCurrentPage, cart, setShowCart, user }) => {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, page: 'home' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, page: 'shop' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, action: 'cart' },
    { id: 'profile', label: 'Profile', icon: User, page: user ? 'profile' : 'auth' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-[800] safe-area-bottom">
      {/* Frosted glass background */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.action !== 'cart' && currentPage === tab.page;
            const isCart = tab.action === 'cart';

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isCart) {
                    setShowCart(true);
                  } else {
                    setCurrentPage(tab.page);
                  }
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 min-w-[60px] ${
                  isActive
                    ? 'text-[#e84393]'
                    : 'text-gray-400 active:scale-90'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-[#e84393] rounded-full" />
                )}

                <div className="relative">
                  <Icon className={`w-[22px] h-[22px] transition-all duration-300 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`} />

                  {/* Cart badge */}
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ${
                  isActive ? 'text-[#e84393]' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;

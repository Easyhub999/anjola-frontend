import { Home, ShoppingBag, User } from 'lucide-react';
import './SiteChrome.css';
const MobileBottomNav = ({ currentPage, setCurrentPage, cart, setShowCart, user }) => {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, page: 'home' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, page: 'shop' },
    { id: 'bag', label: 'Bag', icon: ShoppingBag },
    { id: 'account', label: 'Account', icon: User, page: user ? 'profile' : 'auth' },
  ];
  return <nav className="anjola-bottom-nav" aria-label="Quick navigation">
    {tabs.map(tab => {
      const Icon = tab.icon; const active = tab.page && currentPage === tab.page;
      return <button key={tab.id} aria-current={active ? 'page' : undefined} aria-label={tab.id === 'bag' ? `Bag, ${count} items` : tab.label} onClick={() => tab.page ? setCurrentPage(tab.page) : setShowCart(true)}>
        <span className="anjola-bottom-icon"><Icon size={21} strokeWidth={active ? 2 : 1.5} />{tab.id === 'bag' && count > 0 && <span className="anjola-bottom-count">{count > 99 ? '99+' : count}</span>}</span><span>{tab.label}</span>
      </button>;
    })}
  </nav>;
};
export default MobileBottomNav;

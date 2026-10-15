import PageLink from './PageLink';
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, User, Menu, X, Sparkles, Home, BookOpen, MessageCircle, Package, BarChart3, ClipboardList, LogIn, LogOut, ArrowUpRight, Pause, Play } from 'lucide-react';
import './SiteChrome.css';

const menuItems = [
  { label: 'Home', page: 'home', icon: Home },
  { label: 'Shop', page: 'shop', icon: ShoppingBag },
  { label: 'Journal', page: 'blog', icon: BookOpen },
  { label: 'Contact', page: 'contact', icon: MessageCircle },
];
const adminItems = [
  { label: 'Products', page: 'admin', icon: Package },
  { label: 'Analytics', page: 'admin-analytics', icon: BarChart3 },
  { label: 'Orders', page: 'admin-orders', icon: ClipboardList },
];

const Navigation = ({ currentPage, setCurrentPage, cart, showCart, setShowCart, showMobileMenu, setShowMobileMenu, user, cartBump, handleLogout }) => {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [announcementPaused, setAnnouncementPaused] = useState(false);
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!showMobileMenu) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setShowMobileMenu(false); }
      if (event.key !== 'Tab') return;
      const controls = [...(drawerRef.current?.querySelectorAll('button:not([disabled]), a[href]') || [])];
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onResize = () => { if (window.innerWidth >= 1100) setShowMobileMenu(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [showMobileMenu, setShowMobileMenu]);

  const go = page => { setShowMobileMenu(false); setCurrentPage(page); };
  const renderLinks = (items, mobile = false) => items.map(item => {
    const Icon = item.icon;
    const Tag = menuItems.includes(item) ? PageLink : 'button';
    const action = Tag === PageLink ? { page: item.page, navigate: go } : { onClick: () => go(item.page) };
    return <Tag key={item.page} {...action} aria-current={currentPage === item.page ? 'page' : undefined} className={mobile ? 'anjola-drawer-link' : 'anjola-nav-link'}>
      {mobile && <Icon size={19} strokeWidth={1.5} />}<span>{item.label}</span>{mobile && <ArrowUpRight size={16} />}
    </Tag>;
  });

  return <header className="anjola-site-header">
    <div className={`anjola-announcement ${announcementPaused ? 'is-paused' : ''}`}>
      <span className="sr-only">Beautiful finds. Thoughtful gifts. Little joys.</span>
      <div className="anjola-announcement-track" aria-hidden="true">
        {[0, 1].map(group => <div className="anjola-announcement-group" key={group}>
          {[0, 1, 2].map(item => <span className="anjola-announcement-message" key={item}><Sparkles size={13} /> Beautiful finds. Thoughtful gifts. Little joys.</span>)}
        </div>)}
      </div>
      <button className="anjola-announcement-control" onClick={() => setAnnouncementPaused(paused => !paused)} aria-label={announcementPaused ? 'Resume announcement' : 'Pause announcement'}>
        {announcementPaused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
    <nav className="anjola-nav-bar" aria-label="Main navigation">
      <PageLink className="anjola-wordmark" page="home" navigate={go} aria-label="Anjola Aesthetics home">
        <img src="/anjola-favicon-v2.png" alt="" width="40" height="40" />
        <span><strong>Anjola</strong><small>AESTHETICS</small></span>
      </PageLink>
      <div className="anjola-desktop-links">{renderLinks(menuItems)}{user?.role === 'admin' && <div className="anjola-admin-links">{renderLinks(adminItems)}</div>}</div>
      <div className="anjola-nav-actions">
        <button className="anjola-account-button" onClick={() => go(user ? 'profile' : 'auth')} aria-label={user ? 'My account' : 'Sign in'}><User size={21} strokeWidth={1.5} /><span>{user ? 'Account' : 'Sign in'}</span></button>
        <button className="anjola-bag-button" onClick={() => setShowCart(!showCart)} aria-label={`Shopping bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} aria-expanded={showCart}>
          <ShoppingBag size={21} strokeWidth={1.5} /><span className={`anjola-bag-count ${cartBump ? 'cart-bump' : ''}`}>{cartCount > 99 ? '99+' : cartCount}</span>
        </button>
        <button ref={toggleRef} className="anjola-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Open menu" aria-expanded={showMobileMenu} aria-controls="anjola-mobile-menu"><Menu size={23} /></button>
      </div>
    </nav>
    {showMobileMenu && <div className="anjola-drawer-layer">
      <div className="anjola-drawer-backdrop" onClick={() => setShowMobileMenu(false)} aria-hidden="true" />
      <div ref={drawerRef} id="anjola-mobile-menu" className="anjola-drawer" role="dialog" aria-modal="true" aria-labelledby="anjola-menu-title">
        <div className="anjola-drawer-header">
          <div><span className="anjola-chrome-eyebrow">A LITTLE WORLD OF LOVELY</span><h2 id="anjola-menu-title">Explore Anjola</h2></div>
          <button onClick={() => setShowMobileMenu(false)} aria-label="Close menu"><X size={22} /></button>
          <p>{user ? `Hello, ${user.name || 'lovely'}` : 'Something for you. Something for them.'}</p>
        </div>
        <nav className="anjola-drawer-content" aria-label="Mobile navigation">
          {renderLinks(menuItems, true)}
          {user?.role === 'admin' && <div className="anjola-drawer-admin"><p className="anjola-chrome-eyebrow">STORE MANAGEMENT</p>{renderLinks(adminItems, true)}</div>}
          <button className="anjola-drawer-account" onClick={() => go(user ? 'profile' : 'auth')}><LogIn size={18} />{user ? 'My account & orders' : 'Sign in / Create account'}</button>
          {user && <button className="anjola-signout" onClick={() => { handleLogout?.(); go('home'); }}><LogOut size={17} /> Sign out</button>}
        </nav>
        <div className="anjola-drawer-footer"><p>Need a little help choosing?</p><a href="https://wa.me/2347065943625" target="_blank" rel="noopener noreferrer">Talk to Anjola <ArrowUpRight size={16} /><span className="sr-only"> (opens in a new tab)</span></a><a href="https://instagram.com/anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer">Find us on Instagram <ArrowUpRight size={16} /><span className="sr-only"> (opens in a new tab)</span></a></div>
      </div>
    </div>}
  </header>;
};
export default Navigation;

import { Heart, ArrowUpRight } from 'lucide-react';
import './SiteChrome.css';

const Footer = ({ setCurrentPage }) => <footer className="anjola-site-footer">
  <div className="anjola-footer-inner">
    <div className="anjola-footer-grid">
      <div className="anjola-footer-brand">
        <span className="anjola-chrome-eyebrow">GIFTS · LIFESTYLE · EVERYDAY JOYS</span>
        <h2>Anjola Aesthetics<span>.</span></h2>
        <p>Beautiful finds for your space, your routine, and the people you love.</p>
        <div className="anjola-footer-socials">
          {[
            ['Instagram', 'https://instagram.com/anjola_aesthetics_ng02'],
            ['TikTok', 'https://www.tiktok.com/@anjola_aesthetics_ng02'],
            ['Facebook', 'https://www.facebook.com/AnjolaAestheticsNG'],
          ].map(([label, url]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={13} /><span className="sr-only"> (opens in a new tab)</span></a>)}
        </div>
      </div>
      <nav aria-label="Footer navigation"><h3>Explore</h3>{[['Home', 'home'], ['Shop the collection', 'shop'], ['Journal', 'blog'], ['Contact us', 'contact']].map(([label, page]) => <button key={page} onClick={() => setCurrentPage?.(page)}>{label}</button>)}</nav>
      <div><h3>A little assistance</h3><p>Questions about gifting, a product, or delivery? We’re here to help you choose.</p><a href="https://wa.me/2347065943625" target="_blank" rel="noopener noreferrer" className="anjola-footer-chat">Chat on WhatsApp <ArrowUpRight size={16} /><span className="sr-only"> (opens in a new tab)</span></a></div>
      <address><h3>Find us</h3><p>Abeokuta, Nigeria</p><a href="mailto:anjolaaestheticsng@gmail.com">anjolaaestheticsng@gmail.com</a><a href="tel:+2347065943625">+234 706 594 3625</a><span className="anjola-footer-payment">Payments via Paystack</span></address>
    </div>
    <div className="anjola-footer-bottom"><p>© {new Date().getFullYear()} Anjola Aesthetics. All rights reserved.</p><a href="https://easyhubtech.com" target="_blank" rel="noopener noreferrer">Crafted with <Heart size={12} /> by EasyHub Tech<span className="sr-only"> (opens in a new tab)</span></a></div>
  </div>
</footer>;
export default Footer;

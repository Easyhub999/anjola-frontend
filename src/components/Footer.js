import { Heart, Instagram, ArrowUpRight } from "lucide-react";

const Footer = ({ setCurrentPage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

          {/* BRAND */}
          <div className="md:col-span-1">
            <h2 className="text-white text-2xl font-serif font-semibold mb-3 tracking-tight">
              Anjola Aesthetics
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm mb-6">
              Pretty little things for your daily bliss. Luxury self-care essentials curated with love.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#e84393]/20 flex items-center justify-center text-gray-400 hover:text-[#fbcfe8] transition-all duration-300 group">
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://wa.me/2347065943625" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-all duration-300 group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0a11.9 11.9 0 0 0-10.3 17.94L0 24l6.28-1.64A11.9 11.9 0 0 0 12 24a11.78 11.78 0 0 0 8.52-20.52zM12 22a10 10 0 0 1-5.1-1.4l-.36-.2L2 22l1.6-4.5l-.22-.36A10 10 0 1 1 12 22zm5.2-7.8c-.28-.14-1.65-.82-1.9-.92s-.44-.14-.62.14s-.72.92-.88 1.1s-.32.2-.6.07a8.14 8.14 0 0 1-2.4-1.48a8.9 8.9 0 0 1-1.64-2c-.17-.3 0-.46.13-.6s.3-.34.45-.52s.2-.28.3-.48s.05-.34-.02-.48s-.62-1.48-.85-2s-.47-.44-.65-.45h-.56a1.08 1.08 0 0 0-.78.37a3.17 3.17 0 0 0-1 2.36a5.54 5.54 0 0 0 1.17 3.06A12.3 12.3 0 0 0 10 16.9a14 14 0 0 0 3.32 1.38a7.8 7.8 0 0 0 3.58.36a3 3 0 0 0 2-1.42a2.4 2.4 0 0 0 .18-1.4c-.03-.13-.25-.21-.48-.34z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/AnjolaAestheticsNG" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-500/10 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300 group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.7-3.9c1.1 0 2.2.2 2.2.2v2.4H15c-1.2 0-1.6.8-1.6 1.6V12H18l-.5 3h-2.9v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-[0.15em] mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Shop", page: "shop" },
                { label: "Blog", page: "blog" },
                { label: "Contact", page: "contact" },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage(link.page)}
                    className="text-gray-500 hover:text-white transition-colors duration-300 text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-[0.15em] mb-5">Customer Care</h3>
            <ul className="space-y-3">
              <li className="text-gray-500 text-sm">Free Gift Wrapping</li>
              <li className="text-gray-500 text-sm">Fast Nationwide Shipping</li>
              <li className="text-gray-500 text-sm">Secure Payment</li>
              <li className="text-gray-500 text-sm">Quality Guarantee</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-[0.15em] mb-5">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="text-gray-500 text-sm">anjolaaestheticsng@gmail.com</li>
              <li className="text-gray-500 text-sm">Abeokuta, Nigeria</li>
              <li className="text-gray-500 text-sm">+234 706 594 3625</li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} Anjola Aesthetics. All Rights Reserved.
            </p>

            {/* Built By */}
            <a
              href="https://easyhubtech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors duration-300"
            >
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-[#e84393] fill-current" />
              <span>by</span>
              <span className="font-medium text-gray-500 group-hover:text-white transition-colors">EasyHub Tech</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

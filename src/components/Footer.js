import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* BRAND */}
        <div>
          <h2 className="text-white text-2xl font-semibold mb-4">
            Anjola Aesthetics
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Pretty little things for your daily bliss 😊✨🎀
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Shop</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Customer Care</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Fast Shipping</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
          </ul>
        </div>

        {/* SOCIALS */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Connect</h3>

          <div className="flex items-center gap-6">

            {/* Instagram */}
            <a
              href="https://instagram.com/anjola_aesthetics_ng02"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9z" />
                <path d="M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6z" />
                <circle cx="17" cy="7" r="1" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2347065943625"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0a11.9 11.9 0 0 0-10.3 17.94L0 24l6.28-1.64A11.9 11.9 0 0 0 12 24a11.78 11.78 0 0 0 8.52-20.52zM12 22a10 10 0 0 1-5.1-1.4l-.36-.2L2 22l1.6-4.5l-.22-.36A10 10 0 1 1 12 22zm5.2-7.8c-.28-.14-1.65-.82-1.9-.92s-.44-.14-.62.14s-.72.92-.88 1.1s-.32.2-.6.07a8.14 8.14 0 0 1-2.4-1.48a8.9 8.9 0 0 1-1.64-2c-.17-.3 0-.46.13-.6s.3-.34.45-.52s.2-.28.3-.48s.05-.34-.02-.48s-.62-1.48-.85-2s-.47-.44-.65-.45h-.56a1.08 1.08 0 0 0-.78.37a3.17 3.17 0 0 0-1 2.36a5.54 5.54 0 0 0 1.17 3.06A12.3 12.3 0 0 0 10 16.9a14 14 0 0 0 3.32 1.38a7.8 7.8 0 0 0 3.58.36a3 3 0 0 0 2-1.42a2.4 2.4 0 0 0 .18-1.4c-.03-.13-.25-.21-.48-.34z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@anjola_aesthetics_ng02?_r=1&_t=ZS-91OtMGrR6Yx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 48 48" fill="currentColor">
                <path d="M43 10.4c-2.1.2-4.1-.4-5.8-1.6c-1.7-1.2-2.9-2.9-3.4-4.9h-.1v28.1c0 2-.4 3.8-1.3 5.6c-.9 1.8-2.1 3.3-3.7 4.6c-1.6 1.3-3.4 2.2-5.5 2.7c-2.1.5-4.2.6-6.3.2c-2.1-.4-4.1-1.3-5.8-2.5c-1.7-1.3-3.1-2.9-4.1-4.9C6.3 34.7 5.9 32.6 6 30.4c.1-2.2.7-4.2 1.8-6.1c1.1-1.8 2.6-3.3 4.4-4.3c1.8-1 3.7-1.6 5.8-1.7c1.4 0 2.8.2 4.1.7v6.9c-.9-.3-1.9-.4-2.9-.3c-1.2.1-2.4.4-3.4 1c-1.1.5-2 1.3-2.7 2.3s-1.1 2.1-1.2 3.4c-.1 1.2.2 2.4.7 3.5c.6 1.1 1.4 2 2.5 2.7s2.3 1.1 3.6 1.2c1.3.1 2.5-.1 3.7-.6c1.1-.5 2.1-1.2 2.9-2.2c.8-.9 1.3-2 1.5-3.2c.2-1.3.1-2.6.1-3.9V0h7.2c.3 1.7 1.1 3.3 2.2 4.7s2.6 2.4 4.3 3s3.4.8 5.2.7V10.4z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/AnjolaAestheticsNG"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.7-3.9c1.1 0 2.2.2 2.2.2v2.4H15c-1.2 0-1.6.8-1.6 1.6V12H18l-.5 3h-2.9v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>

          </div>
        </div>
      </div>

      {/* EASYHUB TECH SIGNATURE */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-3">
            {/* Built By Badge */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Crafted with</span>
              <svg className="w-4 h-4 text-pink-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400">by</span>
            </div>

            {/* EasyHub Tech Brand */}
            <a
              href="https://easyhubtech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 rounded-xl border border-pink-500/20 transition-all duration-300 hover:scale-105"
            >
              {/* Logo Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              {/* Company Info */}
              <div className="text-left">
                <div className="text-white font-semibold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
                  EasyHub Tech LTD
                </div>
                <div className="text-gray-400 text-xs">
                  RC: 9283888 • Abeokuta, Nigeria
                </div>
              </div>

              {/* External Link Icon */}
              <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-400 mt-8 text-sm">
        © 2025 Anjola Aesthetics. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
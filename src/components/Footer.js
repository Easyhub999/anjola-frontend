import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-4">Anjola Aesthetics</h3>
            <p className="text-gray-400">Luxury self-care products for the modern woman</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setCurrentPage('shop')} 
                className="block text-gray-400 hover:text-white"
              >
                Shop
              </button>
              <button 
                onClick={() => setCurrentPage('blog')} 
                className="block text-gray-400 hover:text-white"
              >
                Blog
              </button>
              <button 
                onClick={() => setCurrentPage('contact')} 
                className="block text-gray-400 hover:text-white"
              >
                Contact
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <div className="space-y-2">
              <p className="text-gray-400">Shipping & Returns</p>
              <p className="text-gray-400">Privacy Policy</p>
              <p className="text-gray-400">Terms & Conditions</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Anjola Aesthetics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
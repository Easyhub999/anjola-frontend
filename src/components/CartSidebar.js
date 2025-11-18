import React from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';

const CartSidebar = ({ 
  showCart, 
  setShowCart, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  getTotalPrice, 
  setCurrentPage 
}) => {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-96 
      bg-white/95 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.08)]
      border-l border-pink-100
      transform transition-transform duration-300 z-50
      ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6 h-full flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 tracking-tight">
            Your Cart
          </h2>

          <button 
            onClick={() => setShowCart(false)}
            className="p-2 rounded-full hover:bg-pink-100 transition"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4 pr-1">
              {cart.map(item => (
                <div
                  key={item._id}
                  className="flex gap-4 bg-gradient-to-br from-pink-50 to-purple-50 
                  border border-pink-100 p-4 rounded-xl shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>

                    <p className="text-pink-600 font-bold mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-2 mt-3 bg-white/80 p-2 rounded-full shadow-sm">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-7 h-7 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-gray-700 hover:bg-pink-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 shadow"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="border-t border-pink-100 pt-4 mt-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg text-gray-700 font-semibold">Total</span>
              <span className="text-3xl font-bold text-pink-600">
                ₦{getTotalPrice().toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentPage('checkout');
                setShowCart(false);
              }}
              className="w-full bg-gradient-to-r from-[#E9A8C7] to-purple-400
              text-white py-4 text-lg rounded-xl shadow-lg
              hover:opacity-90 transition-all"
            >
              Proceed To Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
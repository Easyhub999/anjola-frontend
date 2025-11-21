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
      className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl 
      transform transition-transform duration-300 z-[1002]
      ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6 pt-28 h-full flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-pink-500" />
            Shopping Cart
          </h2>
          <button 
            onClick={() => setShowCart(false)}
            className="hover:bg-gray-100 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CART CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {

                // ====== SAFE IMAGE ======
                const image =
                  item?.images?.[0] ||
                  item?.image ||
                  "/placeholder.png";

                // ====== QUANTITY (from cart) ======
                const itemQty = item.quantity || 1;

                // ====== PRODUCT STOCK ======
                const productStock = Number(item.stock ?? 999999);
                const isOutOfStock = productStock <= 0;

                // ====== VISIBILITY ======
                const isHidden = item.visible === false;

                return (
                  <div
                    key={`${item._id}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}`}
                    className="flex gap-3 bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl 
                      relative border border-pink-100 hover:shadow-md transition-shadow"
                  >
                    {/* IMAGE */}
                    <img
                      src={image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    />

                    <div className="flex-1 min-w-0">

                      {/* NAME */}
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h3>

                      {/* SIZE & COLOR LABELS */}
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-xs text-gray-600 mb-2">
                          {item.selectedSize && <span className="bg-white px-2 py-0.5 rounded">Size: {item.selectedSize}</span>}
                          {item.selectedSize && item.selectedColor && ' '}
                          {item.selectedColor && <span className="bg-white px-2 py-0.5 rounded">Color: {item.selectedColor}</span>}
                        </p>
                      )}

                      {/* PRICE */}
                      <p className="text-pink-600 font-bold text-base mb-2">
                        ₦{((item.price || 0) * itemQty).toLocaleString()}
                        {itemQty > 1 && (
                          <span className="text-xs text-gray-500 font-normal ml-1">
                            (₦{(item.price || 0).toLocaleString()} each)
                          </span>
                        )}
                      </p>

                      {/* STATUS LABELS */}
                      {isOutOfStock && (
                        <p className="text-red-600 text-xs font-semibold mb-2 bg-red-50 inline-block px-2 py-1 rounded">
                          Out of Stock
                        </p>
                      )}

                      {isHidden && (
                        <p className="text-gray-500 text-xs font-semibold mb-2 bg-gray-100 inline-block px-2 py-1 rounded">
                          Unavailable
                        </p>
                      )}

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-3 mt-3">

                        {/* MINUS BUTTON */}
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={itemQty <= 1}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${itemQty <= 1 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md active:scale-95 border border-gray-300'}
                          `}
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        {/* QUANTITY DISPLAY */}
                        <span className="min-w-[2rem] text-center font-bold text-gray-900 text-lg">
                          {itemQty}
                        </span>

                        {/* PLUS BUTTON - FIXED STYLING */}
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          disabled={isOutOfStock || itemQty >= productStock}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${isOutOfStock || itemQty >= productStock
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg active:scale-95 border border-pink-600'}
                          `}
                          title={isOutOfStock ? "Out of stock" : itemQty >= productStock ? "Max quantity reached" : "Increase quantity"}
                        >
                          <Plus className="w-4 h-4" strokeWidth={3} />
                        </button>

                        {/* REMOVE BUTTON */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 
                            p-2 rounded-lg transition-all active:scale-95"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items):</span>
              <span className="font-semibold">₦{getTotalPrice().toLocaleString()}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline border-t pt-3">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-pink-600">
                ₦{getTotalPrice().toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setCurrentPage("checkout");
                setShowCart(false);
              }}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 
                text-white py-4 rounded-xl font-semibold text-lg
                hover:from-pink-500 hover:to-purple-500 
                hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Proceed to Checkout
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => setShowCart(false)}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
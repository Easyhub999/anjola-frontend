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
      transform transition-transform duration-300 z-50 
      ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6 h-full flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-800">Shopping Cart</h2>
          <button onClick={() => setShowCart(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CART CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {

                // ====== SAFE IMAGE (multiple compatible) ======
                const image =
                  item?.images?.[0] ||
                  item?.image ||
                  "/placeholder.png";

                // ====== INVENTORY ======
                const stock = Number(item.quantity ?? 0);
                const isOutOfStock = stock <= 0;

                // ====== VISIBILITY ======
                const isHidden = item.visible === false;

                return (
                  <div
                    key={`${item._id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4 bg-pink-50 p-4 rounded-lg relative"
                  >
                    {/* IMAGE */}
                    <img
                      src={image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex-1">

                      {/* NAME */}
                      <h3 className="font-medium text-gray-800">
                        {item.name}
                      </h3>

                      {/* SIZE & COLOR LABELS */}
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-xs text-gray-600 mt-1">
                          {item.selectedSize && <>Size: {item.selectedSize} • </>}
                          {item.selectedColor && <>Color: {item.selectedColor}</>}
                        </p>
                      )}

                      {/* PRICE */}
                      <p className="text-pink-600 font-semibold mt-1">
                        ₦{item.price.toLocaleString()}
                      </p>

                      {/* OUT OF STOCK LABEL */}
                      {isOutOfStock && (
                        <p className="text-red-600 text-xs font-semibold mt-1">
                          Out of Stock
                        </p>
                      )}

                      {/* HIDDEN PRODUCT LABEL */}
                      {isHidden && (
                        <p className="text-gray-500 text-xs font-semibold mt-1">
                          Unavailable
                        </p>
                      )}

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center gap-2 mt-3">

                        {/* MINUS */}
                        <button
                          onClick={() => updateQuantity(item._id, item.selectedSize, item.selectedColor, -1)}
                          disabled={item.cartQuantity <= 1}
                          className={`w-7 h-7 rounded flex items-center justify-center 
                            ${item.cartQuantity <= 1 ? 'bg-gray-200' : 'bg-white'}
                          `}
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        {/* SHOW QUANTITY */}
                        <span className="w-8 text-center font-medium">
                          {item.cartQuantity}
                        </span>

                        {/* PLUS BUTTON (Disabled if already at stock limit) */}
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.selectedSize, item.selectedColor, 1)
                          }
                          disabled={isOutOfStock || item.cartQuantity >= stock}
                          className={`w-7 h-7 rounded flex items-center justify-center 
                            ${isOutOfStock || item.cartQuantity >= stock
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-pink-500 text-white'}
                          `}
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* REMOVE */}
                        <button
                          onClick={() =>
                            removeFromCart(item._id, item.selectedSize, item.selectedColor)
                          }
                          className="ml-auto text-red-500"
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
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-pink-600">
                ₦{getTotalPrice().toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentPage("checkout");
                setShowCart(false);
              }}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 
                text-white py-3 rounded-lg hover:from-pink-500 hover:to-purple-500 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
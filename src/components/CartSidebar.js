import { ShoppingCart, X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartSidebar = ({
  showCart, setShowCart, cart, updateQuantity, removeFromCart, getTotalPrice, setCurrentPage
}) => {
  return (
    <>
      {/* Backdrop */}
      {showCart && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001] transition-opacity" onClick={() => setShowCart(false)} />
      )}

      <div className={`fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-luxury-xl
        transform transition-transform duration-400 z-[1002]
        ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="p-6 pt-28 h-full flex flex-col">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-gray-900 flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8B5E83]" />
              Your Cart
              {cart.length > 0 && (
                <span className="text-sm font-sans text-gray-400 font-normal">({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</span>
              )}
            </h2>
            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* CART ITEMS */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-9 h-9 text-gray-200" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => {
                  const image = item?.images?.[0] || item?.image || "/placeholder.png";
                  const itemQty = item.quantity || 1;
                  const productStock = Number(item.stock ?? 999999);
                  const isOutOfStock = productStock <= 0;
                  const hasPieces = item.selectedPieces && item.selectedPieces > 1;
                  const pricePerPiece = item.pricePerPiece || item.price;
                  const cartKey = item.selectedPieces
                    ? `${item._id}-${item.selectedPieces}-${index}`
                    : `${item._id}-${item.selectedSize || 'ns'}-${item.selectedColor || 'nc'}-${index}`;

                  return (
                    <div key={cartKey} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-[#8B5E83]/10 transition-colors">
                      <img src={image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-0.5">{item.name}</h3>

                        {hasPieces && (
                          <p className="text-[11px] text-emerald-600 font-medium mb-0.5">
                            {item.selectedPieces} pieces (₦{pricePerPiece.toLocaleString()}/pc)
                          </p>
                        )}

                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[11px] text-gray-500 mb-1">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && ' · '}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </p>
                        )}

                        <p className="text-[#8B5E83] font-bold text-base mb-2">
                          ₦{((item.price || 0) * itemQty).toLocaleString()}
                          {itemQty > 1 && !hasPieces && (
                            <span className="text-xs text-gray-400 font-normal ml-1">each ₦{(item.price || 0).toLocaleString()}</span>
                          )}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item._id, -1)} disabled={itemQty <= 1}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-xs
                              ${itemQty <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[1.5rem] text-center font-bold text-gray-900 text-sm">{itemQty}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} disabled={isOutOfStock || itemQty >= productStock}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-xs
                              ${isOutOfStock || itemQty >= productStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#8B5E83] text-white hover:bg-[#7a5073]'}`}>
                            <Plus className="w-3 h-3" strokeWidth={3} />
                          </button>
                          <button onClick={() => removeFromCart(item._id)}
                            className="ml-auto text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                            <Trash2 className="w-4 h-4" />
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
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 text-sm">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">₦{getTotalPrice().toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">Shipping calculated at checkout</p>

              <button
                onClick={() => { setCurrentPage("checkout"); setShowCart(false); }}
                className="w-full bg-[#8B5E83] text-white py-4 rounded-xl font-semibold text-base
                  hover:bg-[#7a5073] shadow-md hover:shadow-lg transition-all duration-300
                  flex items-center justify-center gap-2 magnetic-btn">
                <ShoppingBag className="w-5 h-5" />
                Checkout
              </button>

              <button onClick={() => setShowCart(false)}
                className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium transition-colors">
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;

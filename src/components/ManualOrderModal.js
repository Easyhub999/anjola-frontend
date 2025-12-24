import React, { useState } from 'react';
import { X, Search, Plus, Minus, Trash2, Loader } from 'lucide-react';
import { ordersAPI } from '../api';

const ManualOrderModal = ({ isOpen, onClose, products, user }) => {
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    shippingMethod: '',
    shippingCost: 0
  });

  const [orderItems, setOrderItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  const shippingOptions = [
    { id: 'abeokuta', label: 'Delivery Within Abeokuta', price: 1500 },
    { id: 'park', label: 'Park Delivery', price: 0 },
    { id: 'zone1', label: 'Zone 1 (Lagos, Ibadan, etc)', price: 5000 },
    { id: 'zone2', label: 'Zone 2 (Abuja, PH, etc)', price: 6500 },
    { id: 'zone3', label: 'Zone 3 (Northern states)', price: 8000 }
  ];

  const visibleProducts = products.filter(p => p.visible !== false);
  const filteredProducts = visibleProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addProductToOrder = (product) => {
    const exists = orderItems.find(item => item.product === product._id);
    if (exists) {
      setOrderItems(orderItems.map(item =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
    setSearchQuery('');
  };

  const updateQuantity = (productId, change) => {
    setOrderItems(orderItems.map(item =>
      item.product === productId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.product !== productId));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + customerInfo.shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all customer details');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerInfo,
        items: orderItems,
        totalAmount: total,
        paymentStatus,
        status: orderStatus,
        isManualOrder: true
      };

      await ordersAPI.createManualOrder(orderData, user.token);

      alert('✅ Manual order created successfully!');
      
      // Reset form
      setCustomerInfo({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        shippingMethod: '',
        shippingCost: 0
      });
      setOrderItems([]);
      setPaymentStatus('pending');
      setOrderStatus('pending');
      
      onClose();
    } catch (error) {
      alert('Failed to create order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center overflow-y-auto pt-4 pb-20"
      onClick={onClose}
    >
      <div 
       className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 mb-8"
       onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">Create Manual Order</h2>
          <button
            onClick={onClose} 
            type="button"
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              👤 Customer Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                required
                value={customerInfo.fullName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              />
              
              <input
                type="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              />
              
              <input
                type="tel"
                placeholder="Phone Number *"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              />

              <input
                type="text"
                placeholder="City"
                value={customerInfo.city}
                onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="State"
              value={customerInfo.state}
              onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
            />

            <textarea
              placeholder="Delivery Address *"
              required
              rows="2"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
            />

            {/* Shipping Method */}
            <select
              value={customerInfo.shippingMethod}
              onChange={(e) => {
                const selected = shippingOptions.find(opt => opt.id === e.target.value);
                setCustomerInfo({
                  ...customerInfo,
                  shippingMethod: selected?.label || '',
                  shippingCost: selected?.price || 0
                });
              }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select Shipping Method</option>
              {shippingOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} - ₦{opt.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Add Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              🛍️ Order Items
            </h3>

            {/* Product Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No products found</p>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => addProductToOrder(product)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition text-left border-b last:border-b-0"
                    >
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-600">₦{product.price.toLocaleString()}</p>
                      </div>
                      <Plus className="w-5 h-5 text-purple-600" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Items */}
            {orderItems.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.product} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">₦{item.price.toLocaleString()} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product, -1)}
                        className="p-1 bg-white rounded hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product, 1)}
                        className="p-1 bg-white rounded hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-bold text-purple-600 w-24 text-right">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span className="font-semibold">₦{customerInfo.shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-purple-600">₦{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Order Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || orderItems.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Order for my baby...
              </>
            ) : (
              'Create Order'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualOrderModal;
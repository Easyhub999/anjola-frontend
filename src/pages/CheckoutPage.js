import React, { useState } from 'react';
import { Check, Loader, CreditCard, Lock, Truck, Info } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../api';

const CheckoutPage = ({ cart, getTotalPrice, clearCart, setCurrentPage, user }) => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [shippingMethod, setShippingMethod] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  // =============================
  // 🔥 SHIPPING OPTIONS
  // =============================
  const shippingOptions = [
    {
      id: 'abeokuta',
      label: 'Delivery Within Abeokuta',
      price: 1500,
      description: '24-48 hours delivery'
    },
    {
      id: 'park',
      label: 'Park Delivery (Lagos, Ogun, Ilorin, Oyo, Osun, Ondo, Ekiti)',
      price: 0,
      description: 'Negotiate with driver once they call 📞'
    },
    {
      id: 'zone1',
      label: 'Lagos, Akure, Ado-Ekiti, Ibadan, Ogbomosho, Oshogbo, Ota, Ilorin',
      price: 5000,
      description: 'Doorstep Delivery (3-7 days)'
    },
    {
      id: 'zone2',
      label: 'Aba, Asaba, Enugu, Onitsha, Owerri, Umuahia, Abuja, Benin, Calabar, Port-Harcourt, Uyo, Warri, Yenagoa',
      price: 6500,
      description: 'Doorstep Delivery (3-7 days)'
    },
    {
      id: 'zone3',
      label: 'Lafia, Lokoja, Makurdi, Minna, Bauchi, Jalingo, Jos, Gombe, Maiduguri, Damaturu, Yola, Kaduna, Katsina, Dutse, Birnin Kebbi, Sokoto, Kano',
      price: 8000,
      description: 'Doorstep Delivery (3-7 days)'
    }
  ];

  const selectedShipping = shippingOptions.find(opt => opt.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const totalAmount = getTotalPrice() + shippingCost;

  // =============================
  // 🔥 CREATE ORDER & REDIRECT TO PAYSTACK
  // =============================
  const handleProceedToPayment = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    if (!shippingMethod) {
      alert('Please select a shipping method');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Step 1: Create Order
      const orderData = {
        customerInfo: {
          ...formData,
          shippingMethod: selectedShipping?.label || 'Not selected',
          shippingCost: shippingCost
        },
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: totalAmount
      };

      const order = await ordersAPI.createOrder(orderData, user?.token);
      console.log('✅ Order created:', order._id);

      // Step 2: Initialize Payment
      const paymentData = {
        email: formData.email,
        amount: totalAmount * 100, // Convert to kobo
        orderId: order._id,
        customerInfo: formData
      };

      const paymentResponse = await paymentsAPI.initializePayment(paymentData);

      if (paymentResponse.success && paymentResponse.data.authorization_url) {

        // Redirect to Paystack
        window.location.href = paymentResponse.data.authorization_url;
      } else {
        throw new Error('Payment initialization failed');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order: ' + error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // =============================
  // 🔥 CHECKOUT PAGE UI
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12 text-gray-800">Secure Checkout</h1>

        {/* DELIVERY INFORMATION BANNER */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-pink-600" />
                Delivery Information
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <strong>Delivery Days:</strong> Tuesday and Saturday
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <strong>Within Abeokuta:</strong> 24-48 hours
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <strong>Nationwide:</strong> 3-7 working days
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <strong>Tracking number will be sent via your email address</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT SIDE - FORM */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                  placeholder="08012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                    placeholder="Lagos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-600" />
                  Shipping Method *
                </label>
                <select
                  required
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none transition appearance-none cursor-pointer bg-white"
                  style={{ fontSize: '16px' }}
                >
                  <option value="">-- Select Shipping Method --</option>
                  {shippingOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label} - ₦{option.price.toLocaleString()}
                    </option>
                  ))}
                </select>

                {selectedShipping && (
                  <div className="mt-3 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-sm text-pink-800">
                      <strong>{selectedShipping.label}</strong>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{selectedShipping.description}</p>
                    <p className="text-lg font-bold text-pink-600 mt-2">
                      ₦{selectedShipping.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                <label className="flex items-center p-4 border-2 border-pink-400 bg-pink-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-pink-600"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-600" />
                    <span className="font-medium">Pay with Paystack</span>
                  </div>
                </label>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={checkoutLoading || !shippingMethod}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay ₦{totalAmount.toLocaleString()} with Paystack
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                <Lock className="w-4 h-4" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b">
                    <img 
                      src={item.images?.[0] || item.image || "/placeholder.png"}
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₦{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-pink-600">
                    {shippingCost > 0 ? `₦${shippingCost.toLocaleString()}` : 'Select method'}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-4">
                  <span>Total</span>
                  <span className="text-pink-600">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {selectedShipping && (
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800 flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Shipping:</strong> {selectedShipping.label}
                    </span>
                  </p>
                </div>
              )}

              <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-4">
                <p className="text-sm text-pink-800">
                  <strong>💳 Secure Payment:</strong> Your payment information is encrypted and secured with Paystack.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
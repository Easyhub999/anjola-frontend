import React, { useState } from 'react';
import { Check, Loader, CreditCard, Lock } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../api';
import { PaystackButton } from 'react-paystack';

const CheckoutPage = ({ cart, getTotalPrice, clearCart, setCurrentPage, user }) => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const totalAmount = getTotalPrice() + 2500; // SHIPPING INCLUDED


  // =============================
  // 🔥 CREATE ORDER BEFORE PAYMENT
  // =============================
  const handleCreateOrder = async () => {
    setCheckoutLoading(true);

    try {
      const orderData = {
        customerInfo: formData,
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: totalAmount
      };

      const order = await ordersAPI.createOrder(orderData, user?.token);
      setCurrentOrder(order);
      return order;
    } catch (error) {
      alert('Failed to create order: ' + error.message);
      throw error;
    } finally {
      setCheckoutLoading(false);
    }
  };


  // =============================
  // 🔥 PAYSTACK CONFIG
  // =============================
  const paystackConfig = {
    reference: `ANJ${Date.now()}`,
    email: formData.email,
    amount: totalAmount * 100, // Paystack uses KOBO
    publicKey: "pk_test_xxxxxxxxxxxxxxxxxxxxxx",   // <<<< PUT YOUR REAL KEY HERE
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: formData.fullName
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: formData.phone
        }
      ]
    }
  };


  // =============================
  // 🔥 HANDLE PAYMENT SUCCESS
  // =============================
  const handlePaymentSuccess = async (reference) => {
    setCheckoutLoading(true);

    try {
      const verification = await paymentsAPI.verifyPayment(reference.reference);

      if (verification.success) {
        setOrderPlaced(true);
        clearCart();

        setTimeout(() => {
          setOrderPlaced(false);
          setCurrentPage('home');
        }, 5000);
      }
    } catch (error) {
      alert('Payment verification failed: ' + error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };


  // =============================
  // 🔥 HANDLE PAYMENT CANCEL
  // =============================
  const handlePaymentClose = () => {
    alert('Payment cancelled. Your order is still pending payment.');
  };


  // =============================
  // 🔥 PAYSTACK BUTTON PROPS
  // =============================
  const componentProps = {
    ...paystackConfig,
    text: (
      <div className="flex items-center justify-center gap-2">
        <Lock className="w-5 h-5" />
        Pay ₦{totalAmount.toLocaleString()} with Paystack
      </div>
    ),
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
  };


  // =============================
  // 🔥 FORM SUBMIT HANDLER
  // =============================
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await handleCreateOrder();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };


  // =============================
  // 🔥 PAYMENT SUCCESS SCREEN
  // =============================
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">Thank you for shopping with Anjola Aesthetics</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Order confirmed!</strong><br />
              Check your email for order details and tracking information.
            </p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }


  // =============================
  // 🔥 CHECKOUT PAGE UI
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12 text-gray-800">Secure Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT SIDE - FORM */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

            <form onSubmit={handleCheckout} className="space-y-4">
              {/* FORM FIELDS */}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              {/* CITY / STATE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                <label className="flex items-center p-4 border-2 border-pink-400 bg-pink-50 rounded-lg">
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

              {/* PAYSTACK BUTTON */}
              <PaystackButton
                {...componentProps}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-4 rounded-lg mt-4"
                disabled={checkoutLoading}
              />

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                <Lock className="w-4 h-4" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
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
                  <span>₦2,500</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-4">
                  <span>Total</span>
                  <span className="text-pink-600">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

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
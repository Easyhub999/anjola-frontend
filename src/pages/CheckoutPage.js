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

  const totalAmount = getTotalPrice() + 2500;

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

  const paystackConfig = {
    reference: `ANJ${Date.now()}`,
    email: formData.email,
    amount: totalAmount * 100,
    publicKey: "pk_test_2f5d9bd0006358b6aa1010e2ec42c30f49b33a29",
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "customer_name", value: formData.fullName },
        { display_name: "Phone", variable_name: "phone", value: formData.phone }
      ]
    }
  };

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

  const handlePaymentClose = () => {
    alert('Payment cancelled. Your order is pending payment.');
  };

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

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE5EF] to-[#F3E8FF] pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border border-[#E9A8C7]/20">

          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-serif text-gray-800 mb-3 tracking-wide">
            Payment Successful!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for shopping with <span className="font-semibold text-[#E9A8C7]">Anjola Aesthetics</span>.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>Your order is confirmed!</strong><br />
              A receipt and tracking details have been sent to your email.
            </p>
          </div>

          <p className="text-sm text-gray-500 italic">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE5EF] via-[#F7EFFF] to-[#F3E8FF] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        
        <h1 className="text-4xl font-serif text-center mb-12 text-gray-900 tracking-wide">
          Secure Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-10">

          {/* LEFT SIDE */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-[#E9A8C7]/20">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 tracking-wide">
              Shipping Information
            </h2>

            <form onSubmit={handleCheckout} className="space-y-5">

              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7] outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7]"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7]"
                  placeholder="08012345678"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Delivery Address *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7]"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              {/* CITY + STATE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7]"
                    placeholder="Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-xl focus:ring-2 focus:ring-[#E9A8C7]"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              {/* PAYMENT METHOD BOX */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Method</h3>

                <label className="flex items-center p-4 border-2 border-[#E9A8C7] bg-[#FDEEF6] rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-pink-600"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#E9A8C7]" />
                    <span className="font-medium text-gray-800">Pay with Paystack</span>
                  </div>
                </label>
              </div>

              {/* PAYSTACK BUTTON */}
              <PaystackButton
                {...componentProps}
                className="w-full bg-gradient-to-r from-[#E9A8C7] to-[#D7B8E8] text-white py-4 rounded-xl mt-4 shadow-md hover:opacity-90 transition"
                disabled={checkoutLoading}
              />

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                <Lock className="w-4 h-4" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY */}
          <div>
            <div className="bg-white rounded-3xl shadow-xl p-10 sticky top-24 border border-[#E9A8C7]/20">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200/50">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
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

              <div className="border-t pt-4 space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{getTotalPrice().toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₦2,500</span>
                </div>

                <div className="flex justify-between text-xl font-bold border-t pt-4 text-gray-800">
                  <span>Total</span>
                  <span className="text-[#E9A8C7]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 bg-[#FDEEF6] border border-[#E9A8C7]/40 rounded-xl p-4">
                <p className="text-sm text-[#C276A9] leading-relaxed">
                  <strong>💳 Secure Payment:</strong> Your card details and personal information are encrypted and handled safely through Paystack.
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
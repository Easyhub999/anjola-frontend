import { useEffect, useState } from 'react';
import { Loader, CreditCard, Lock, Truck, Gift } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../api';

const CheckoutPage = ({ cart, getTotalPrice, clearCart, user }) => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [shippingMethod, setShippingMethod] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', state: ''
  });

  const shippingOptions = [
    { id: 'abeokuta', label: 'Delivery Within Abeokuta', price: 0, description: '24-48 hours delivery' },
    { id: 'park', label: 'Park Delivery (Lagos, Ogun, Ilorin, Oyo, Osun, Ondo, Ekiti)', price: 0, description: 'Negotiate with driver once they call' },
    { id: 'zone1', label: 'Lagos, Akure, Ado-Ekiti, Ibadan, Ogbomosho, Oshogbo, Ota, Ilorin', price: 5600, description: 'Doorstep Delivery (3-7 days)' },
    { id: 'zone2', label: 'Aba, Asaba, Enugu, Onitsha, Owerri, Umuahia, Abuja, Benin, Calabar, Port-Harcourt, Uyo, Warri, Yenagoa', price: 7000, description: 'Doorstep Delivery (3-7 days)' },
    { id: 'zone3', label: 'Lafia, Lokoja, Makurdi, Minna, Bauchi, Jalingo, Jos, Gombe, Maiduguri, Damaturu, Yola, Kaduna, Katsina, Dutse, Birnin Kebbi, Sokoto, Kano', price: 8500, description: 'Doorstep Delivery (3-7 days)' }
  ];

  const selectedShipping = shippingOptions.find(opt => opt.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const totalAmount = getTotalPrice() + shippingCost;

  const handleProceedToPayment = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) { alert('Please fill in all required fields'); return; }
    if (!shippingMethod) { alert('Please select a shipping method'); return; }
    setCheckoutLoading(true);
    try {
      const orderData = {
        customerInfo: { ...formData, shippingMethod: selectedShipping?.label || 'Not selected', shippingCost, isGift, giftMessage: isGift ? giftMessage : '' },
        items: cart.map(item => ({
          product: item._id, name: item.name, price: item.price, quantity: item.quantity,
          selectedSize: item.selectedSize || null, selectedColor: item.selectedColor || null,
          selectedPieces: item.selectedPieces || null, pricePerPiece: item.pricePerPiece || null
        })),
        totalAmount
      };
      const order = await ordersAPI.createOrder(orderData, user?.token);
      const paymentData = { email: formData.email, amount: totalAmount * 100, orderId: order._id, customerInfo: formData };
      const paymentResponse = await paymentsAPI.initializePayment(paymentData);
      if (paymentResponse.success && paymentResponse.data.authorization_url) {
        window.location.href = paymentResponse.data.authorization_url;
      } else { throw new Error('Payment initialization failed'); }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order: ' + error.message);
    } finally { setCheckoutLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fffbf7] pt-8 pb-4">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-10 text-gray-900">Checkout</h1>

        {/* Delivery Info Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-card">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-[#8B5E83]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Delivery Information</h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p><strong>Delivery Days:</strong> Tuesday and Saturday</p>
                <p><strong>Within Abeokuta:</strong> 24-48 hours</p>
                <p><strong>Nationwide:</strong> 3-7 working days</p>
                <p><strong>Tracking number</strong> will be sent via email</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT - FORM */}
          <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100">
            <h2 className="text-xl font-serif mb-6 text-gray-900">Shipping Information</h2>
            <div className="space-y-4">
              {[
                { label: "Full Name", key: "fullName", type: "text", placeholder: "Enter your full name" },
                { label: "Email Address", key: "email", type: "email", placeholder: "your.email@example.com" },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "08012345678" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                  <input type={type} required value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10 focus:outline-none transition text-sm"
                    placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address *</label>
                <textarea required rows="2" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10 focus:outline-none transition text-sm"
                  placeholder="Enter your complete delivery address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ label: "City", key: "city" }, { label: "State", key: "state" }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                    <input type="text" required value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:outline-none transition text-sm"
                      placeholder={label} />
                  </div>
                ))}
              </div>

              {/* Gift Option */}
              <div className="border-t border-gray-100 pt-5 mt-5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#8B5E83] focus:ring-[#8B5E83]" />
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#8B5E83]" />
                    <span className="font-medium text-sm text-gray-700">This is a gift</span>
                  </div>
                </label>
                {isGift && (
                  <textarea rows="2" placeholder="Add a personal message for the recipient..." value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:outline-none transition text-sm"
                  />
                )}
              </div>

              {/* Shipping Method */}
              <div className="border-t border-gray-100 pt-5 mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8B5E83]" /> Shipping Method *
                </label>
                <select required value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:outline-none transition cursor-pointer bg-white text-sm"
                  style={{ fontSize: '16px' }}>
                  <option value="">-- Select Shipping Method --</option>
                  {shippingOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label} - ₦{option.price.toLocaleString()}</option>
                  ))}
                </select>
                {selectedShipping && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-800">{selectedShipping.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedShipping.description}</p>
                    <p className="text-lg font-bold text-[#8B5E83] mt-1">₦{selectedShipping.price.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="border-t border-gray-100 pt-5 mt-5">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <label className="flex items-center p-4 border-2 border-[#8B5E83]/30 bg-[#8B5E83]/5 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#8B5E83]" />
                  <div className="ml-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#8B5E83]" />
                    <span className="font-medium text-sm">Pay with Paystack</span>
                  </div>
                </label>
              </div>

              <button onClick={handleProceedToPayment} disabled={checkoutLoading || !shippingMethod}
                className="w-full bg-[#8B5E83] text-white py-4 rounded-xl font-semibold hover:bg-[#7a5073] transition-all duration-300
                  shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base magnetic-btn">
                {checkoutLoading ? (<><Loader className="w-5 h-5 animate-spin" /> Processing...</>) : (<><Lock className="w-5 h-5" /> Pay ₦{totalAmount.toLocaleString()}</>)}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                <Lock className="w-3 h-3" /> Secure SSL Encrypted Payment
              </div>
            </div>
          </div>

          {/* RIGHT - SUMMARY */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-8 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-serif mb-6 text-gray-900">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => {
                  const hasPieces = item.selectedPieces && item.selectedPieces > 1;
                  return (
                    <div key={`${item._id}-${index}`} className="flex gap-3 pb-4 border-b border-gray-50">
                      <img src={item.images?.[0] || item.image || "/placeholder.png"} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                        {hasPieces ? (
                          <p className="text-xs text-emerald-600 font-medium">{item.selectedPieces} pieces</p>
                        ) : (
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        )}
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ' · '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>₦{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#8B5E83]">{shippingCost > 0 ? `₦${shippingCost.toLocaleString()}` : 'Select method'}</span>
                </div>
                {isGift && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Gift wrapping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t border-gray-100 pt-3 mt-2">
                  <span>Total</span><span className="text-gray-900">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

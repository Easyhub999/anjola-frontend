import React, { useState, useEffect } from 'react';
import { Check, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { paymentsAPI } from '../api';

const PaymentSuccessPage = ({ setCurrentPage, clearCart }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    verifyPaymentFromUrl();
  }, []);

  const verifyPaymentFromUrl = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');

      if (!reference) {
        setError('No payment reference found');
        setLoading(false);
        return;
      }

      console.log('🔍 Verifying payment:', reference);

      const verification = await paymentsAPI.verifyPayment(reference);

      console.log('✅ Verification response:', verification);

      if (verification.success) {
        setSuccess(true);
        setOrderDetails(verification.data);
        clearCart();

        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
          setCurrentPage('home');
        }, 5000);
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    verifyPaymentFromUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <Loader className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-gray-800 mb-4">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 pt-24 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Verification
            </button>
            
            <button
              onClick={() => setCurrentPage('home')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        
        {orderDetails?.metadata?.orderId && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Order ID:</strong> {orderDetails.metadata.orderId}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">Redirecting to homepage in 5 seconds...</p>
        
        <button
          onClick={() => setCurrentPage('home')}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
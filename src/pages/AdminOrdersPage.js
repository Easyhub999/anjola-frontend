import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Loader, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../api';

const recordedAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const money = value => recordedAmount(value) ? `₦${value.toLocaleString('en-NG')}` : 'Not recorded';

const OrderItems = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-gray-600">No item details were recorded for this order.</p>;
  }

  return items.map((entry, index) => {
    const item = entry || {};
    const hasQuantity = Number.isInteger(item.quantity) && item.quantity > 0;
    const hasPack = Number.isInteger(item.selectedPieces) && item.selectedPieces > 1;
    const lineTotal = hasQuantity && recordedAmount(item.price) ? item.quantity * item.price : null;
    return (
      <div key={item._id || index} className="flex flex-wrap justify-between gap-3 p-3 bg-purple-50 rounded-lg">
        <div className="min-w-0 flex-1 break-words">
          <p className="font-medium">{item.name || item.product?.name || 'Product name not recorded'}</p>
          <p className="text-sm text-gray-700 mt-1">
            Quantity: {hasQuantity ? item.quantity : 'Not recorded'}{hasPack ? ` ${item.quantity === 1 ? 'pack' : 'packs'} of ${item.selectedPieces} pieces` : ''}
          </p>
          {hasPack && hasQuantity && <p className="text-sm text-gray-700">Total pieces: {item.quantity * item.selectedPieces}</p>}
          <p className="text-sm text-gray-600">{hasPack ? 'Pack price' : 'Unit price'}: {money(item.price)}</p>
          {hasPack && recordedAmount(item.pricePerPiece) && <p className="text-sm text-gray-600">Price per piece: {money(item.pricePerPiece)}</p>}
          {(item.selectedSize || item.selectedColor) && (
            <p className="text-sm text-purple-700 mt-1">
              {item.selectedSize && <span className="mr-3">Size: <strong>{item.selectedSize}</strong></span>}
              {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Item total</p>
          <p className="font-bold text-purple-700">{money(lineTotal)}</p>
        </div>
      </div>
    );
  });
};

const AdminOrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      setOrdersError(null);
      const data = await ordersAPI.getAllOrders(user.token);
      if (!Array.isArray(data.data)) throw new Error('Invalid orders response');
      setOrders(data.data);
    } catch (error) {
      setOrdersError(error.status === 401 ? 'Your session has expired. Sign in again to manage orders.' : 'Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') fetchOrders();
  }, [fetchOrders, user?.role]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const existing = orders.find(order => order._id === orderId);
      const payload = { status: newStatus };
      if (newStatus === 'shipped') payload.trackingNumber = (trackingDrafts[orderId] ?? existing?.trackingNumber ?? '').trim();
      const response = await ordersAPI.updateOrderStatus(orderId, payload, user.token);
      const updated = response.data;
      setOrders(orders.map(order => 
        order._id === orderId ? updated : order
      ));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      alert('Order status updated successfully!');
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✓ Paid</span>;
    } else if (status === 'failed') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">✗ Failed</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⏳ Pending</span>;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-gray-800">Order Management</h1>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{orders.length}</span>
            <span className="text-gray-600">Total Orders</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              {status} ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {ordersError ? (
          <div role="alert" className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-700 mb-4">{ordersError}</p>
            <button onClick={fetchOrders} className="bg-purple-600 text-white px-5 py-2 rounded-lg">Retry</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        Order #{order.orderNumber || order._id.slice(-8)}
                      </h3>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-semibold capitalize">{order.status}</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`${selectedOrder?._id === order._id ? 'Hide' : 'View'} items for order ${order.orderNumber || order._id.slice(-8)}`}
                      aria-expanded={selectedOrder?._id === order._id}
                      aria-controls={`order-details-${order._id}`}
                      onClick={() => setSelectedOrder(previous => previous?._id === order._id ? null : order)}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 font-semibold rounded-lg hover:bg-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600 focus-visible:outline-offset-2 transition"
                    >
                      <Eye className="w-5 h-5" aria-hidden="true" />
                      {selectedOrder?._id === order._id ? 'Hide items' : 'View items'}
                      {Array.isArray(order.items) && <span> ({order.items.length})</span>}
                    </button>
                  </div>
                </div>

                {order.inventoryReviewReason && (
                  <p role="alert" className="mb-4 rounded-lg bg-amber-50 border border-amber-300 p-3 text-amber-900">
                    {order.inventoryReviewReason}
                  </p>
                )}
                {order.paymentReviewReason && (
                  <p role="alert" className="mb-4 rounded-lg bg-amber-50 border border-amber-300 p-3 text-amber-900">
                    {order.paymentReviewReason}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer</p>
                    <p className="font-semibold text-gray-800">{order.customerInfo.fullName}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                    <p className="text-sm text-gray-800">{order.customerInfo.address}</p>
                    <p className="text-sm text-gray-800">{order.customerInfo.city}, {order.customerInfo.state}</p>
                  </div>
                </div>

                {selectedOrder?._id === order._id && (
                  <div id={`order-details-${order._id}`} role="region" aria-label={`Details for order ${order.orderNumber || order._id.slice(-8)}`} className="border-t pt-4 mt-4">
                    {order.customerInfo.isGift && (
                      <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold">Gift wrapping requested</h4>
                        <p className="whitespace-pre-wrap break-words">{order.customerInfo.giftMessage || 'No gift message provided.'}</p>
                      </div>
                    )}
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2 mb-4">
                      <OrderItems items={order.items} />
                    </div>

                    {order.customerInfo.shippingMethod && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold text-blue-800">🚚 Shipping:</span>{' '}
                          <span className="text-gray-700">{order.customerInfo.shippingMethod}</span>
                        </p>
                        {order.customerInfo.shippingCost > 0 && (
                          <p className="text-sm text-blue-600 font-semibold mt-1">
                            Shipping Cost: ₦{order.customerInfo.shippingCost.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xl font-bold border-t pt-3">
                      <span>Total Amount:</span>
                      <span className="text-purple-600">{money(order.totalAmount)}</span>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <label htmlFor={`tracking-${order._id}`} className="block font-semibold mb-2">Tracking number</label>
                      <input id={`tracking-${order._id}`} maxLength={200}
                        value={trackingDrafts[order._id] ?? order.trackingNumber ?? ''}
                        onChange={event => setTrackingDrafts(previous => ({ ...previous, [order._id]: event.target.value }))}
                        disabled={updatingStatus || !['processing', 'shipped'].includes(order.status)}
                        className="border rounded-lg px-3 py-2 mb-3 w-full" />
                      {order.status === 'shipped' && (
                        <button onClick={() => handleUpdateStatus(order._id, 'shipped')} disabled={updatingStatus}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg mb-4">Save tracking number</button>
                      )}
                      <h4 className="font-semibold mb-3">Update Order Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(order._id, status)}
                            disabled={updatingStatus || order.status === status}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition flex items-center gap-2 ${
                              order.status === status
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {getStatusIcon(status)}
                            <span>{status}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

import React, { useState, useEffect } from 'react';
import {
  Package, Truck, CheckCircle, XCircle, Clock, Eye,
  Loader, AlertCircle
} from 'lucide-react';

import { ordersAPI } from '../api';

const AdminOrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAllOrders(user.token);
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: newStatus }, user.token);

      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      alert('Order status updated!');
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          Paid
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Failed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
        Pending
      </span>
    );
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter(o => o.status === filterStatus);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE7F3] to-[#EDE9FE] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE7F3] to-[#EDE9FE] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#E9A8C7] mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE7F3] to-[#EDE9FE] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-gray-900">Order Management</h1>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#E9A8C7]" />
            <span className="text-2xl font-bold text-[#E9A8C7]">{orders.length}</span>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-[#E9A8C7] text-white shadow'
                  : 'bg-white text-gray-700 hover:bg-pink-50'
              }`}
            >
              {status} ({status === 'all'
                ? orders.length
                : orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {/* ORDERS */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >

                {/* TOP ROW */}
                <div className="flex flex-wrap justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.orderNumber || order._id.slice(-8)}
                      </h3>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>

                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-semibold capitalize">{order.status}</span>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedOrder(selectedOrder?._id === order._id ? null : order)
                      }
                      className="p-2 bg-pink-50 text-[#E9A8C7] rounded-lg hover:bg-pink-100 transition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* CUSTOMER INFO */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{order.customerInfo.fullName}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium">{order.customerInfo.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.city}, {order.customerInfo.state}
                    </p>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                {selectedOrder?._id === order._id && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-lg mb-4">Order Items</h4>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between p-3 bg-pink-50 rounded-xl"
                        >
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                            </p>
                          </div>

                          <p className="font-bold text-[#E9A8C7]">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                      <span>Total Amount</span>
                      <span className="text-[#E9A8C7]">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* STATUS UPDATE */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-3">Update Status</h4>

                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <button
                            key={s}
                            disabled={updatingStatus || order.status === s}
                            onClick={() => handleUpdateStatus(order._id, s)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize flex items-center gap-2 transition ${
                              order.status === s
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-[#E9A8C7] text-white hover:bg-pink-500'
                            }`}
                          >
                            {getStatusIcon(s)}
                            {s}
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
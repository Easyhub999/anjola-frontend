import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  Loader,
  Mail,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { analyticsAPI } from '../api';

const AdminAnalyticsPage = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllAnalytics();
    }
  }, [user]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      const [revenue, monthly, products, orderStat, paymentStat] = await Promise.all([
        analyticsAPI.getRevenueAnalytics(user.token),
        analyticsAPI.getMonthlyBreakdown(user.token, 6),
        analyticsAPI.getTopProducts(user.token, 5, selectedPeriod),
        analyticsAPI.getOrderStatusBreakdown(user.token, selectedPeriod),
        analyticsAPI.getPaymentStatusBreakdown(user.token, selectedPeriod)
      ]);

      setRevenueData(revenue.data);
      setMonthlyData(monthly.data);
      setTopProducts(products.data);
      setOrderStatus(orderStat.data);
      setPaymentStatus(paymentStat.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      alert('Failed to load analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllAnalytics();
    setRefreshing(false);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif text-gray-800 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your revenue and sales performance</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RevenueCard
            title="Today"
            gross={revenueData?.today?.grossRevenue || 0}
            net={revenueData?.today?.netRevenue || 0}
            orders={revenueData?.today?.orderCount || 0}
            icon={<Calendar className="w-6 h-6" />}
            gradient="from-blue-500 to-cyan-500"
          />
          
          <RevenueCard
            title="This Week"
            gross={revenueData?.week?.grossRevenue || 0}
            net={revenueData?.week?.netRevenue || 0}
            orders={revenueData?.week?.orderCount || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-green-500 to-emerald-500"
          />
          
          <RevenueCard
            title="This Month"
            gross={revenueData?.month?.grossRevenue || 0}
            net={revenueData?.month?.netRevenue || 0}
            orders={revenueData?.month?.orderCount || 0}
            icon={<BarChart3 className="w-6 h-6" />}
            gradient="from-purple-500 to-pink-500"
          />
          
          <RevenueCard
            title="This Year"
            gross={revenueData?.year?.grossRevenue || 0}
            net={revenueData?.year?.netRevenue || 0}
            orders={revenueData?.year?.orderCount || 0}
            icon={<DollarSign className="w-6 h-6" />}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* All Time Revenue - Big Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Time Revenue</h2>
            <ShoppingBag className="w-10 h-10 opacity-80" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-purple-200 text-sm mb-1">Gross Revenue</p>
              <p className="text-4xl font-bold">₦{(revenueData?.all?.grossRevenue || 0).toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-purple-200 text-sm mb-1">Net Revenue</p>
              <p className="text-4xl font-bold">₦{(revenueData?.all?.netRevenue || 0).toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-purple-200 text-sm mb-1">Total Orders</p>
              <p className="text-4xl font-bold">{revenueData?.all?.orderCount || 0}</p>
            </div>
          </div>

          {revenueData?.all?.cancelledRevenue > 0 && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-red-200">
                <TrendingDown className="w-5 h-5" />
                <span className="text-sm">Cancelled Revenue: ₦{(revenueData.all.cancelledRevenue).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Trend (Last 6 Months)</h2>
          <MonthlyRevenueChart data={monthlyData} />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Selling Products</h2>
            
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">Sold: {product.totalQuantity} units</p>
                    </div>
                    
                    <p className="font-bold text-purple-600">
                      ₦{product.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order & Payment Status */}
          <div className="space-y-8">
            
            {/* Order Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Status</h2>
              
              {orderStatus && (
                <div className="space-y-3">
                  <StatusBar 
                    label="Pending" 
                    count={orderStatus.pending || 0} 
                    color="bg-yellow-500"
                    total={Object.values(orderStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Processing" 
                    count={orderStatus.processing || 0} 
                    color="bg-blue-500"
                    total={Object.values(orderStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Shipped" 
                    count={orderStatus.shipped || 0} 
                    color="bg-purple-500"
                    total={Object.values(orderStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Delivered" 
                    count={orderStatus.delivered || 0} 
                    color="bg-green-500"
                    total={Object.values(orderStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Cancelled" 
                    count={orderStatus.cancelled || 0} 
                    color="bg-red-500"
                    total={Object.values(orderStatus).reduce((a, b) => a + b, 0)}
                  />
                </div>
              )}
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Status</h2>
              
              {paymentStatus && (
                <div className="space-y-3">
                  <StatusBar 
                    label="Paid" 
                    count={paymentStatus.paid || 0} 
                    color="bg-green-500"
                    total={Object.values(paymentStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Pending" 
                    count={paymentStatus.pending || 0} 
                    color="bg-yellow-500"
                    total={Object.values(paymentStatus).reduce((a, b) => a + b, 0)}
                  />
                  <StatusBar 
                    label="Failed" 
                    count={paymentStatus.failed || 0} 
                    color="bg-red-500"
                    total={Object.values(paymentStatus).reduce((a, b) => a + b, 0)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Reports Section */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-8 border-2 border-pink-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Email Reports</h2>
              <p className="text-gray-600">Automated weekly and monthly revenue reports</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">Weekly Reports</p>
                  <p className="text-sm text-gray-600">Every Monday at 9:00 AM</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">Monthly Reports</p>
                  <p className="text-sm text-gray-600">1st of each month at 9:00 AM</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                📧 <strong>Reports will be sent to:</strong> {user?.email}
              </p>
              <p className="text-xs text-purple-600 mt-2">
                Includes revenue breakdown, top products, and order statistics
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// REVENUE CARD COMPONENT
// ==========================================
const RevenueCard = ({ title, gross, net, orders, icon, gradient }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Gross Revenue</p>
          <p className="text-2xl font-bold text-gray-800">₦{gross.toLocaleString()}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Net Revenue</p>
          <p className="text-xl font-semibold text-green-600">₦{net.toLocaleString()}</p>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">{orders} orders</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STATUS BAR COMPONENT
// ==========================================
const StatusBar = ({ label, count, color, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// ==========================================
// MONTHLY REVENUE CHART COMPONENT
// ==========================================
const MonthlyRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No data available</p>;
  }

  const maxRevenue = Math.max(...data.map(d => d.grossRevenue));
  
  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((month, index) => {
          const grossHeight = (month.grossRevenue / maxRevenue) * 100;
          const netHeight = (month.netRevenue / maxRevenue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end h-56">
                {/* Gross Revenue Bar */}
                <div 
                  className="flex-1 bg-gradient-to-t from-purple-400 to-purple-600 rounded-t-lg relative group transition-all duration-300 hover:scale-105"
                  style={{ height: `${grossHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Gross: ₦{month.grossRevenue.toLocaleString()}
                  </div>
                </div>
                
                {/* Net Revenue Bar */}
                <div 
                  className="flex-1 bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg relative group transition-all duration-300 hover:scale-105"
                  style={{ height: `${netHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Net: ₦{month.netRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 font-medium">{month.month}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded"></div>
          <span className="text-sm text-gray-600">Gross Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
          <span className="text-sm text-gray-600">Net Revenue</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
import { useState, useEffect } from 'react';
import { LogOut, Heart, ShoppingBag, Package, X } from 'lucide-react';
import { authAPI, ordersAPI } from '../api';

const ProfilePage = ({ user, setUser, setCurrentPage, wishlist, toggleWishlist, setSelectedProduct }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) { setLoadingOrders(false); return; }
      try {
        const data = await ordersAPI.getMyOrders(user.token);
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
      finally { setLoadingOrders(false); }
    };
    fetchOrders();
  }, [user?.token]);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setCurrentPage('home');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTimelineStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-[#fff7f9] pt-8 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#e84393] to-[#f472b6] rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-serif font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#e84393]/10 text-[#e84393] text-xs font-semibold rounded-full">Admin</span>
                )}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition-all text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card border border-gray-100 mb-6">
          {[
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-[#e84393] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-10 h-10 border-3 border-gray-200 border-t-[#e84393] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-400 text-sm mb-4">Start shopping to see your order history!</p>
                <button onClick={() => setCurrentPage('shop')}
                  className="bg-[#e84393] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#d63384] transition-colors">
                  Browse Products
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const step = getTimelineStep(order.status);
                return (
                  <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Order #{order.orderNumber || order._id?.slice(-8)}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Timeline */}
                    <div className="flex items-center gap-1 mb-4">
                      {['Placed', 'Processing', 'Shipped', 'Delivered'].map((label, i) => (
                        <div key={label} className="flex-1 flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            i < step ? 'bg-[#e84393] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>{i + 1}</div>
                          <p className={`text-[9px] ${i < step ? 'text-[#e84393] font-medium' : 'text-gray-400'}`}>{label}</p>
                          {i < 3 && <div className={`h-0.5 w-full mt-1 ${i < step - 1 ? 'bg-[#e84393]' : 'bg-gray-100'}`} />}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <p className="text-sm text-gray-500">{order.items?.length || 0} item(s)</p>
                      <p className="text-lg font-bold text-gray-900">₦{(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {!wishlist || wishlist.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">Your wishlist is empty</h3>
                <p className="text-gray-400 text-sm mb-4">Save items you love for later!</p>
                <button onClick={() => setCurrentPage('shop')}
                  className="bg-[#e84393] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#d63384] transition-colors">
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlist.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card group">
                    <div className="relative h-40 overflow-hidden cursor-pointer"
                      onClick={() => { setSelectedProduct(product); setCurrentPage('product'); }}>
                      <img src={product.images?.[0] || product.image || '/placeholder.png'} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-sm font-bold text-[#e84393] mb-2">₦{product.price.toLocaleString()}</p>
                      <button onClick={() => toggleWishlist(product)}
                        className="w-full text-xs text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-1">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

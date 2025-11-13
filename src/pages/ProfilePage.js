import React from 'react';
import { User, LogOut } from 'lucide-react';
import { authAPI } from '../api';

const ProfilePage = ({ user, setUser, setCurrentPage }) => {
  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <p className="text-gray-600">No orders yet. Start shopping to see your order history!</p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Saved Items</h2>
              <p className="text-gray-600">You haven't saved any items yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
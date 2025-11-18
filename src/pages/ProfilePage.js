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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FCE7F3] to-[#F9D9EA] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#F6D3E2]">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F3B4D3] to-[#E9A8C7] rounded-full flex items-center justify-center shadow-md">
                <User className="w-10 h-10 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>

                {user?.role === 'admin' && (
                  <span className="inline-block mt-1 px-3 py-1 bg-[#FCE7F3] text-[#D6336C] text-xs font-semibold rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#D6336C] text-white px-4 py-2 rounded-lg 
              hover:bg-[#B82B5A] transition shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* CONTENT SECTIONS */}
          <div className="space-y-8">

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Order History</h2>
              <p className="text-gray-600">
                No orders yet. Start shopping to see your order history!
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Saved Items</h2>
              <p className="text-gray-600">
                You haven't saved any items yet.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
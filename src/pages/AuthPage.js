import React, { useState } from "react";
import { Loader } from "lucide-react";
import { authAPI } from "../api";

const AuthPage = ({ setUser, setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      let userData;

      if (isLogin) {
        userData = await authAPI.login(formData.email, formData.password);
      } else {
        userData = await authAPI.register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      setUser(userData);

      if (userData?.role === "admin") {
        setCurrentPage("admin");
      } else {
        setCurrentPage("home");
      }
    } catch (error) {
      setAuthError(error.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5FA] to-[#E9A8C7]/40 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[#E9A8C7]/30">

        <h1 className="text-3xl font-serif text-center mb-6 text-gray-900">
          {isLogin ? "Welcome Back" : "Join the Anjola Family"}
        </h1>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required={!isLogin}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#E9A8C7]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#E9A8C7]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#E9A8C7]/40 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#E9A8C7]"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#E9A8C7] text-white py-3 rounded-lg 
            hover:bg-[#d88bb0] transition disabled:opacity-50 
            flex items-center justify-center gap-2 shadow-lg"
          >
            {authLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#E9A8C7] hover:text-[#d88bb0] font-medium"
          >
            {isLogin
              ? "Don't have an account? Create one"
              : "Already a member? Sign in"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
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

      // LOGIN
      if (isLogin) {
        userData = await authAPI.login(formData.email, formData.password);
      }
      // REGISTER
      else {
        userData = await authAPI.register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      // Save user in global state
      setUser(userData);

      // Redirect based on role
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">

        <h1 className="text-3xl font-serif text-center mb-6 text-gray-800">
          {isLogin ? "Welcome Back" : "Join the Anjola Family"}
        </h1>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* NAME FIELD - only for register */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required={!isLogin}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-400 
            text-white py-3 rounded-lg hover:from-pink-500 hover:to-purple-500 
            transition disabled:opacity-50 flex items-center justify-center gap-2"
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

        {/* SWITCH LOGIN <-> REGISTER */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-600 hover:text-pink-700 font-medium"
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
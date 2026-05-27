import { useState } from "react";
import { Loader, Eye, EyeOff, Sparkles } from "lucide-react";
import { authAPI } from "../api";

const AuthPage = ({ setUser, setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const userData = isLogin
        ? await authAPI.login(formData.email, formData.password)
        : await authAPI.register(formData.name, formData.email, formData.password);
      setUser(userData);
      setCurrentPage(userData?.role === "admin" ? "admin" : "home");
    } catch (error) {
      setAuthError(error.message || "Authentication failed");
    } finally { setAuthLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#8B5E83]" />
            <span className="text-sm font-medium text-[#8B5E83] tracking-wide">Anjola Aesthetics</span>
          </div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Join the Family"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Sign in to your account" : "Create your account to start shopping"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100">
          {authError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" required={!isLogin} value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10 focus:outline-none transition text-sm"
                  placeholder="Enter your full name" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10 focus:outline-none transition text-sm"
                placeholder="your.email@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-[#8B5E83] focus:ring-3 focus:ring-[#8B5E83]/10 focus:outline-none transition text-sm"
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={authLoading}
              className="w-full bg-[#8B5E83] text-white py-3.5 rounded-xl font-semibold hover:bg-[#7a5073]
                transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg magnetic-btn">
              {authLoading ? (<><Loader className="w-5 h-5 animate-spin" /> Processing...</>) : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setAuthError(null); }}
              className="text-[#8B5E83] hover:text-[#7a5073] font-medium text-sm transition-colors">
              {isLogin ? "Don't have an account? Create one" : "Already a member? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

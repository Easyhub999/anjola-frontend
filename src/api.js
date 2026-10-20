import backendConfig from './backendConfig.json';

// ==========================================
// API BASE URL
// ==========================================

const API_URL = backendConfig.apiUrl;

// ==========================================
// Helper: Handle API Responses
// ==========================================

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw Object.assign(new Error(data.message || "Something went wrong"), { status: response.status });
  }

  return data;
};

// Small helper: normalize user object so frontend is always consistent
const normalizeUser = (data) => {
  // If backend returns { token, user: {...} }
  if (data?.user && data?.token) {
    return {
      ...data.user,
      token: data.token,
    };
  }

  // If backend already returns { token, role, ... }
  if (data?.token) {
    return data;
  }

  // Fallback – just return as-is
  return data;
};


// ==========================================
// AUTH API
// ==========================================

export const authAPI = {

  // Register
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await handleResponse(response);

      // Normalize first (in case backend wraps data)
      const normalizedUser = normalizeUser(data);

      // If we have a token, also fetch /auth/me to be 100% sure about role
      if (normalizedUser?.token) {
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${normalizedUser.token}`,
          },
        });

        const me = await handleResponse(meResponse);

        const finalUser = {
          ...normalizedUser,
          role: me.role ?? normalizedUser.role,
        };

        localStorage.setItem("user", JSON.stringify(finalUser));
        return finalUser;
      }

      // No token? just return normalized object
      return normalizedUser;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse(response);

      // Step 1: normalize backend shape
      const normalizedUser = normalizeUser(data);

      if (!normalizedUser?.token) {
        throw new Error("No token returned from login");
      }

      // Step 2: call /auth/me to get current user with accurate role from DB
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${normalizedUser.token}`,
        },
      });

      const me = await handleResponse(meResponse);

      // Step 3: final user object we store in localStorage
      const finalUser = {
        ...normalizedUser,
        role: me.role ?? normalizedUser.role,
      };

      localStorage.setItem("user", JSON.stringify(finalUser));
      return finalUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("user");
  }
};

// ==========================================
// PRODUCTS API
// ==========================================

export const productsAPI = {
  uploadImage: async (file, token) => {
    const body = new FormData(); body.append('image', file);
    const response = await fetch(`${API_URL}/products/upload-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
    const data = await handleResponse(response);
    if (!data.imageUrl) throw new Error('Upload did not return an image. Please try again.');
    return data.imageUrl;
  },
  getProduct: async (id, options = {}) => {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, { signal: options.signal });
    const result = await handleResponse(response);
    return result.data;
  },


  // Get all products
  getAllProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      if (filters.featured) {
        queryParams.append("featured", "true");
      }

      const url = queryParams.toString()
        ? `${API_URL}/products?${queryParams}`
        : `${API_URL}/products`;

      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error("Get products error:", error);
      throw error;
    }
  },

  // Create product
  createProduct: async (productData, token) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData, token) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId, token) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

     if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      return response.json();
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },
  
  // ⭐ ADD REVIEW
  addReview: async (productId, reviewData, token) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(reviewData)
      });

      const data = await handleResponse(response);
      return data.data; // this will be updated product
    } catch (error) {
      console.error("Add review error:", error);
      throw error;
    }
  }
};

// ==========================================
// ORDERS API
// ==========================================

export const ordersAPI = {
  getOrderNotifications: async (id, token, options = {}) => {
    const response = await fetch(`${API_URL}/orders/${id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }, signal: options.signal
    });
    return handleResponse(response);
  },

  retryNotification: async (id, notificationId, token) => {
    const response = await fetch(`${API_URL}/orders/${id}/notifications/${notificationId}/retry`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  sendOrderNotification: async (id, type, token) => {
    const response = await fetch(`${API_URL}/orders/${id}/notifications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type })
    });
    return handleResponse(response);
  },

  updateNotificationPreferences: async (id, enabled, token) => {
    const response = await fetch(`${API_URL}/orders/${id}/notifications/preferences`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ enabled })
    });
    return handleResponse(response);
  },

  recordPayment: async (id, payment, token) => {
    const response = await fetch(`${API_URL}/orders/${id}/record-payment`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payment) });
    return handleResponse(response);
  },

  // Create Order (customer)
  createOrder: async (orderData, token) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData)
      });

      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  // Create Manual Order (admin)
  createManualOrder: async (orderData, token) => {
    const res = await fetch(`${API_URL}/orders/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return { ...data.data, emailConfirmation: data.emailConfirmation };
  },

  // ADMIN: Get all orders
  getAllOrders: async (token) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get all orders error:", error);
      throw error;
    }
  },


  // Get user's own orders
  getMyOrders: async (token) => {
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await handleResponse(response);
      return data.data || data;
    } catch (error) {
      console.error("Get my orders error:", error);
      throw error;
    }
  },

  // ADMIN: Update order status
  updateOrderStatus: async (orderId, data, token) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  }
};



// ==========================================
// PAYMENT API
// ==========================================

export const paymentsAPI = {

  // Initialize payment
  initializePayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_URL}/orders/initialize-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Initialize payment error:", error);
      throw error;
    }
  },


  // Verify Payment
  verifyPayment: async (reference, options = {}) => {
    try {
      const response = await fetch(`${API_URL}/orders/verify-payment/${encodeURIComponent(reference)}`, { signal: options.signal });
      return await handleResponse(response);
    } catch (error) {
      console.error("Verify payment error:", error);
      throw error;
    }
  }
};

// ==========================================
// ANALYTICS API
// ==========================================

export const analyticsAPI = {
  
  // Get revenue analytics
  getRevenueAnalytics: async (token) => {
    try {
      const response = await fetch(`${API_URL}/analytics/revenue`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get revenue analytics error:", error);
      throw error;
    }
  },

  // Get monthly breakdown
  getMonthlyBreakdown: async (token, months = 12) => {
    try {
      const response = await fetch(`${API_URL}/analytics/monthly-breakdown?months=${months}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get monthly breakdown error:", error);
      throw error;
    }
  },

  // Get top products
  getTopProducts: async (token, limit = 10, period = 'all') => {
    try {
      const response = await fetch(`${API_URL}/analytics/top-products?limit=${limit}&period=${period}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get top products error:", error);
      throw error;
    }
  },

  // Get order status breakdown
  getOrderStatusBreakdown: async (token, period = 'all') => {
    try {
      const response = await fetch(`${API_URL}/analytics/order-status?period=${period}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get order status error:", error);
      throw error;
    }
  },

  // Get payment status breakdown
  getPaymentStatusBreakdown: async (token, period = 'all') => {
    try {
      const response = await fetch(`${API_URL}/analytics/payment-status?period=${period}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get payment status error:", error);
      throw error;
    }
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

const apiExport = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  payments: paymentsAPI,
  analytics: analyticsAPI
};

export default apiExport;

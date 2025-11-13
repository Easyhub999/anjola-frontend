// ==========================================
// API BASE URL
// ==========================================

const API_URL = process.env.REACT_APP_API_URL || "https://anjola-backend-2.onrender.com/api";


// ==========================================
// Helper: Handle API Responses
// ==========================================

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

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

      if (data.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
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

      if (data.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
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
          "Authorization": `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  }
};



// ==========================================
// ORDERS API
// ==========================================

export const ordersAPI = {

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
  verifyPayment: async (reference) => {
    try {
      const response = await fetch(`${API_URL}/orders/verify-payment/${reference}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Verify payment error:", error);
      throw error;
    }
  }
};



// ==========================================
// DEFAULT EXPORT
// ==========================================

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  payments: paymentsAPI
};
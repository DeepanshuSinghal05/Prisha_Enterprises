import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials for httpOnly cookies
const adminAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Automatically send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});


// Intercept requests to fetch CSRF token if missing for mutating requests
adminAxios.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (!document.cookie || !document.cookie.includes('XSRF-TOKEN=')) {
      try {
        await axios.get(`${API_URL}/health`, { withCredentials: true });
      } catch (e) {
        console.warn('Failed to pre-fetch CSRF token', e);
      }
    }
  }
  return config;
});

const adminAPI = {

  /**
   * Admin login
   */
  login: async (credentials) => {
    const response = await adminAxios.post('/admin/login', credentials);
    return response.data;
  },

  /**
   * Admin logout
   */
  logout: async () => {
    const response = await adminAxios.post('/admin/logout');
    return response.data;
  },

  /**
   * Get current admin profile
   */
  getProfile: async () => {
    const response = await adminAxios.get('/admin/me');
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const response = await adminAxios.get('/admin/stats');
    return response.data;
  },

  /**
   * Get orders with search, filter, pagination
   */
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await adminAxios.get(`/admin/orders?${query}`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    const response = await adminAxios.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, data) => {
    const response = await adminAxios.patch(`/admin/orders/${orderId}/status`, data);
    return response.data;
  }
};

export default adminAPI;
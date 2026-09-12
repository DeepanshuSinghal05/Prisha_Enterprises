import axios from 'axios';
import { getCsrfToken, isMutatingMethod } from './csrf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials for httpOnly cookies
const adminAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Automatically send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});


// Use the same CSRF-token source as the fetch-based customer API client.
adminAxios.interceptors.request.use(async (config) => {
  if (isMutatingMethod(config.method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
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
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    const response = await adminAxios.get(
      `/admin/orders${query ? `?${query}` : ''}`
    );

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
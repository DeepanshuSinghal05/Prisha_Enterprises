
/**
 * API Service for Prisha Enterprises
 * Handles all backend API communication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request handler
 */
export const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const method = (options.method || 'GET').toUpperCase();

  // If mutating request and no CSRF cookie, fetch it first
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!document.cookie || !document.cookie.includes('XSRF-TOKEN=')) {
      try {
        await fetch(`${API_URL}/health`, { credentials: 'include' });
      } catch (e) {
        console.warn('Failed to pre-fetch CSRF token', e);
      }
    }
  }
  // Extract XSRF-TOKEN from cookies for CSRF protection
  let csrfToken = null;
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      if (cookie.trim().startsWith('XSRF-TOKEN=')) {
        csrfToken = cookie.trim().substring('XSRF-TOKEN='.length);
        break;
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important to send httpOnly cookies
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if(contentType.includes('application/json')) {
      data = await response.json();
  } else {
      const text = await response.text();
      // Handle the case where server responds with something other than JSON
      if (!response.ok) throw new Error(`Server returned ${response.status} instead of expected JSON.`);
      data = text;
  }

  // Handle 401 Unauthorized via Token Refresh
  if (response.status === 401 && !isRetry && endpoint !== '/auth/refresh' && !endpoint.startsWith('/admin')) {
    try {
      // Try to refresh token
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        // Token refreshed successfully, retry the original request
        return await apiRequest(endpoint, options, true);
      } else {
        // Refresh failed (refresh token expired/invalid)
        localStorage.removeItem('prisha_auth_token');
        localStorage.removeItem('prisha_auth_user');
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired. Please login again.');
      }
    } catch (refreshErr) {
      if (refreshErr.message.includes('Session expired')) {
        throw refreshErr;
      }
      localStorage.removeItem('prisha_auth_token');
      localStorage.removeItem('prisha_auth_user');
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data || 'API request failed');
  }

  return data;
};

/**
 * Product API methods
 */
export const products = {
  // Get all products
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },

  // Get a single product by ID
  getById: (id) => apiRequest(`/products/${id}`),

  // Search products
  search: (query) => {
    return apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  },
};

/**
 * Address API methods
 */
export const addressAPI = {
  // Get all addresses for current user
  getAll: () => apiRequest('/addresses'),

  // Get single address by ID
  getById: (id) => apiRequest(`/addresses/${id}`),

  // Create new address
  create: (data) => apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update address
  update: (id, data) => apiRequest(`/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Delete address
  delete: (id) => apiRequest(`/addresses/${id}`, {
    method: 'DELETE',
  }),

  // Set as default address
  setDefault: (id) => apiRequest(`/addresses/${id}/default`, {
    method: 'PATCH',
  }),
};

/**
 * Cart/Checkout API methods
 */
export const cartAPI = {
  // Create checkout order and get Razorpay order
  createCheckoutOrder: (items, shippingAddress) =>
    apiRequest('/cart/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify({ items, shippingAddress }),
    }),

  // Verify payment after Razorpay payment
  verifyPayment: (
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  ) =>
    apiRequest('/cart/checkout/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    }),

  // Mock payment (for testing without Razorpay)
  processMockPayment: (items, shippingAddress) =>
    apiRequest('/cart/checkout/place-order', {
      method: 'POST',
      body: JSON.stringify({ items, shippingAddress }),
    }),
};

/**
 * Order API methods
 */
export const orderAPI = {
  // Get all orders for current user
  getMyOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders/my-orders${query ? `?${query}` : ''}`);
  },

  // Get order by ID
  getById: (id) => apiRequest(`/orders/${id}`),

  // Update order status
  updateStatus: (id, status) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ order_status: status }),
    }),
};

/**
 * Compatibility alias
 *
 * MyOrdersPage.jsx imports:
 * import { orders as orderApi } from '../services/api';
 */
export const orders = orderAPI;

/**
 * Default export
 */
export default {
  products,
  addressAPI,
  cartAPI,
  orderAPI,
  orders,
};


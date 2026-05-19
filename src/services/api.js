import axios from 'axios';
import toast from 'react-hot-toast';

// Dynamic base URL: works on localhost AND any network IP
const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ─── Request: attach access token ────────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: handle token refresh ──────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept 401s for auth routes (login, register, refresh)
    const isAuthRoute = originalRequest.url.includes('/auth/login') || 
                        originalRequest.url.includes('/auth/register') ||
                        originalRequest.url.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (_) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        const path = window.location.pathname;
        if (path.startsWith('/admin') && path !== '/admin/login') {
          window.location.href = '/admin/login';
        } else if (path.startsWith('/dashboard') || path.startsWith('/checkout') || path.startsWith('/order-confirm')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFeatured: () => API.get('/products/featured'),
  getNewArrivals: () => API.get('/products/new-arrivals'),
  getById: (id) => API.get(`/products/${id}`),
  getBySlug: (slug) => API.get(`/products/slug/${slug}`),
  getRelated: (id) => API.get(`/products/related/${id}`),
  create: (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => {
    // If data is a FormData instance, send multipart; otherwise send JSON
    const isForm = data instanceof FormData;
    return API.put(`/products/${id}`, data,
      isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
  delete: (id) => API.delete(`/products/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  getBySlug: (slug) => API.get(`/categories/${slug}`),
  create: (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart', data),
  update: (itemId, data) => API.put(`/cart/${itemId}`, data),
  remove: (itemId) => API.delete(`/cart/${itemId}`),
  clear: () => API.delete('/cart'),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post('/wishlist/toggle', { productId }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my', { params }),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  getAll: (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.patch(`/orders/${id}/status`, data),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId, params) => API.get(`/reviews/product/${productId}`, { params }),
  add: (productId, data) => API.post(`/reviews/product/${productId}`, data),
  delete: (reviewId) => API.delete(`/reviews/${reviewId}`),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (data) => API.post('/coupons/validate', data),
  getAll: () => API.get('/coupons'),
  create: (data) => API.post('/coupons', data),
  update: (id, data) => API.put(`/coupons/${id}`, data),
  delete: (id) => API.delete(`/coupons/${id}`),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => API.post('/payment/create-order', data),
  verify: (data) => API.post('/payment/verify', data),
  getKey: () => API.get('/payment/key'),
};

// ─── Banners ──────────────────────────────────────────────────────────────────
export const bannersAPI = {
  getActive: () => API.get('/banners'),
  getAll: () => API.get('/banners/admin/all'),
  create: (data) => API.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/banners/${id}`),
};

// ─── Users (Admin) ────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  toggleBlock: (id) => API.patch(`/users/${id}/block`),
  createAdmin: (data) => API.post('/users/admin', data),
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/change-password', data),
  addAddress: (data) => API.post('/users/addresses', data),
  updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => API.patch(`/users/addresses/${id}/default`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export const layoutAPI = {
  get: () => API.get('/layout'),
  update: (data) => API.put('/layout', data),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return API.post('/upload', fd);
  },
  uploadVideo: (file) => {
    const fd = new FormData();
    fd.append('video', file);
    return API.post('/upload/video', fd);
  },
};

// ─── Notification Rules (Admin) ───────────────────────────────────────────────
export const notificationRulesAPI = {
  list:   ()         => API.get('/notification-rules'),
  create: (data)     => API.post('/notification-rules', data),
  update: (id, data) => API.put(`/notification-rules/${id}`, data),
  delete: (id)       => API.delete(`/notification-rules/${id}`),
};

export default API;

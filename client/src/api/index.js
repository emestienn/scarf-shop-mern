import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lp-auth');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export const productsApi = {
  getAll:      (params) => api.get('/products', { params }),
  getBySlug:   (slug)   => api.get(`/products/${slug}`),
  getFeatured: ()       => api.get('/products/featured'),
  addReview:   (slug, data) => api.post(`/products/${slug}/reviews`, data),
};

export const ordersApi = {
  create:       (data) => api.post('/orders', data),
  getMyOrders:  ()     => api.get('/orders/my-orders'),
  getById:      (id)   => api.get(`/orders/${id}`),
};

export const paymentsApi = {
  getClickUrl: (orderId) => api.get(`/payments/click/url/${orderId}`),
  getPaymeUrl: (orderId) => api.get(`/payments/payme/url/${orderId}`),
};

export const authApi = {
  register:         (data) => api.post('/auth/register', data),
  login:            (data) => api.post('/auth/login', data),
  telegramLogin:    (data) => api.post('/auth/telegram', data),
  getProfile:       ()     => api.get('/auth/profile'),
  updateProfile:    (data) => api.put('/auth/profile', data),
  applyWholesale:   (data) => api.post('/auth/wholesale-apply', data),
};

export const adminApi = {
  getDashboard:      ()         => api.get('/admin/dashboard'),
  getUsers:          (params)   => api.get('/admin/users', { params }),
  approveWholesale:  (id)       => api.put(`/admin/users/${id}/approve-wholesale`),
  deactivateUser:    (id)       => api.put(`/admin/users/${id}/deactivate`),
  getAllProducts:     (params)   => api.get('/products', { params: { limit: 100, ...params } }),
  createProduct:     (data)     => api.post('/products', data),
  updateProduct:     (id, data) => api.put(`/products/${id}`, data),
  deleteProduct:     (id)       => api.delete(`/products/${id}`),
  getAllOrders:       (params)   => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export default api;

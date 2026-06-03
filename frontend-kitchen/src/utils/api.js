import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('snack_user'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {}
  return config;
});

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getOrders = (params) => api.get('/orders', { params }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
export const getStats = (params) => api.get('/orders/stats', { params }).then((r) => r.data);

export const getMenuAdmin = () => api.get('/menu/all').then((r) => r.data);
export const createMenuItem = (data) => api.post('/menu', data).then((r) => r.data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data).then((r) => r.data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`).then((r) => r.data);

export const getTables = () => api.get('/tables').then((r) => r.data);
export const createTablesBulk = (count) => api.post('/tables/bulk', { count }).then((r) => r.data);

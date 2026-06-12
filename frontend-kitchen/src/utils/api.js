import axios from 'axios';

function getDefaultApiBaseURL() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window === 'undefined') return '/api';

  const { protocol, hostname, port } = window.location;
  const privateLanHost = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
  const viteDevOrPreview = ['5174', '4173'].includes(port);

  if (privateLanHost || viteDevOrPreview) {
    return `${protocol}//${hostname}:5000/api`;
  }

  return '/api';
}

const apiBaseURL = getDefaultApiBaseURL();
const api = axios.create({ baseURL: apiBaseURL.replace(/\/$/, '') });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('snack_user'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {}
  return config;
});

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const saveFcmToken = (token) => api.post('/auth/fcm-token', { token }).then((r) => r.data);
export const getOrders = (params) => api.get('/orders', { params }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
export const getStats = (params) => api.get('/orders/stats', { params }).then((r) => r.data);

export const getMenuAdmin = () => api.get('/menu/all').then((r) => r.data);
export const createMenuItem = (data) => api.post('/menu', data).then((r) => r.data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data).then((r) => r.data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`).then((r) => r.data);

export const getTables = () => api.get('/tables').then((r) => r.data);
export const createTablesBulk = (count) => api.post('/tables/bulk', { count }).then((r) => r.data);

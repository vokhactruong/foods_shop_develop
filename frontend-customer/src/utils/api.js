import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: apiBaseURL.replace(/\/$/, '') });

export const getMenu = (category) =>
  api.get('/menu', { params: category !== 'all' ? { category } : {} }).then((r) => r.data);

export const placeOrder = (data) => api.post('/orders', data).then((r) => r.data);

export const createTableSession = (tableNumber) =>
  api.post('/tables/sessions', { tableNumber }).then((r) => r.data);

export const validateTableSession = (token) =>
  api.get('/tables/sessions/validate', { params: { token } }).then((r) => r.data);


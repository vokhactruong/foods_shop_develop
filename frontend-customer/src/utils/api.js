import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getMenu = (category) =>
  api.get('/menu', { params: category !== 'all' ? { category } : {} }).then((r) => r.data);

export const placeOrder = (data) => api.post('/orders', data).then((r) => r.data);

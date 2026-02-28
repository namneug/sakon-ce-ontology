import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';
// Base URL without /api suffix (for serving uploaded files etc.)
export const API_BASE_URL = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);

// Enterprises
export const getEnterprises = () => api.get('/enterprises');
export const getEnterpriseById = (id) => api.get(`/enterprises/${id}`);

// Search
export const searchProducts = (q) => api.get('/search', { params: { q } });
export const semanticSearch = (q) => api.get('/search/semantic', { params: { q } });
export const searchByCertification = (q) => api.get('/search/certification', { params: { q } });

// Categories
export const getCategories = () => api.get('/categories');
export const getCategoryProducts = (id) => api.get(`/categories/${id}/products`);

// Analytics
export const getAnalyticsOverview = () => api.get('/analytics/overview');
export const getPriceByCategory = () => api.get('/analytics/price-by-category');
export const getChannels = () => api.get('/analytics/channels');
export const getCertifications = () => api.get('/analytics/certifications');
export const getEnterpriseProducts = () => api.get('/analytics/enterprise-products');
export const getCustomerSegments = () => api.get('/analytics/customers');
export const getTopRated = () => api.get('/analytics/top-rated');
export const getSharedIngredients = () => api.get('/analytics/shared-ingredients');

// Recommendations
export const getSimilarProducts = (id) => api.get(`/recommendations/${id}/similar`);

// Health
export const getHealth = () => api.get('/health');

// Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Admin
export const adminLogin = (username, password) =>
  api.post('/admin/login', { username, password });

export const adminLogout = (token) =>
  api.post('/admin/logout', {}, { headers: { Authorization: `Bearer ${token}` } });

export const adminGetProducts = (token) =>
  api.get('/admin/products', { headers: { Authorization: `Bearer ${token}` } });

export const adminCreateProduct = (token, data) =>
  api.post('/admin/products', data, { headers: { Authorization: `Bearer ${token}` } });

export const adminUpdateProduct = (token, id, data) =>
  api.put(`/admin/products/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const adminDeleteProduct = (token, id) =>
  api.delete(`/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const adminGetEnterprises = (token) =>
  api.get('/admin/enterprises', { headers: { Authorization: `Bearer ${token}` } });

export const adminCreateEnterprise = (token, data) =>
  api.post('/admin/enterprises', data, { headers: { Authorization: `Bearer ${token}` } });

export const adminUpdateEnterprise = (token, id, data) =>
  api.put(`/admin/enterprises/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const adminDeleteEnterprise = (token, id) =>
  api.delete(`/admin/enterprises/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default api;

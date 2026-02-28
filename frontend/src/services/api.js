import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

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

export default api;

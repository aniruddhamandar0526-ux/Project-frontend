import { javaClient } from './axiosConfig';

// Auth endpoints
export const authAPI = {
  login: (credentials) => javaClient.post('/auth/login', credentials),
  register: (data) => javaClient.post('/auth/register', data),
  ping: () => javaClient.get('/auth/ping'),
};

// Product endpoints (Admin)
export const productAPI = {
  getAll: (params = {}) => javaClient.get('/products', { params }),
  getById: (id) => javaClient.get(`/products/${id}`),
  create: (data) => javaClient.post('/products', data),
  update: (id, data) => javaClient.put(`/products/${id}`, data),
  delete: (id) => javaClient.delete(`/products/${id}`),
};

// Customer endpoints (Admin)
export const customerAPI = {
  getAll: (params = {}) => javaClient.get('/customers', { params }),
  getById: (id) => javaClient.get(`/customers/${id}`),
  create: (data) => javaClient.post('/customers', data),
  update: (id, data) => javaClient.put(`/customers/${id}`, data),
  delete: (id) => javaClient.delete(`/customers/${id}`),
};

// Warehouse endpoints (Admin)
export const warehouseAPI = {
  getAll: (params = {}) => javaClient.get('/warehouses', { params }),
  getById: (id) => javaClient.get(`/warehouses/${id}`),
  create: (data) => javaClient.post('/warehouses', data),
  update: (id, data) => javaClient.put(`/warehouses/${id}`, data),
  delete: (id) => javaClient.delete(`/warehouses/${id}`),
};

// Order endpoints (Manager & Customer)
export const orderAPI = {
  getAll: (params = {}) => javaClient.get('/orders', { params }),
  getById: (id) => javaClient.get(`/orders/${id}`),
  create: (data) => javaClient.post('/orders', data),
  update: (id, data) => javaClient.put(`/orders/${id}`, data),
  updateStatus: (id, status) => javaClient.put(`/orders/${id}/status`, { status }),
};

// Inventory endpoints (Manager)
export const inventoryAPI = {
  getByWarehouse: (warehouseId) => javaClient.get(`/inventory/warehouse/${warehouseId}`),
  update: (id, data) => javaClient.put(`/inventory/${id}`, data),
};

// Vehicle endpoints (Manager)
export const vehicleAPI = {
  getAll: (params = {}) => javaClient.get('/vehicles', { params }),
  getById: (id) => javaClient.get(`/vehicles/${id}`),
  updateStatus: (id, status) => javaClient.put(`/vehicles/${id}/status`, { status }),
  updateLocation: (id, location) => javaClient.put(`/vehicles/${id}/location`, location),
};

// Dashboard endpoints
export const dashboardAPI = {
  getAdminStats: () => javaClient.get('/dashboard/admin/stats'),
  getManagerStats: () => javaClient.get('/dashboard/manager/stats'),
  getCustomerStats: () => javaClient.get('/dashboard/customer/stats'),
  getRecentOrders: (limit = 10) => javaClient.get('/dashboard/recent-orders', { params: { limit } }),
  getLowStockAlerts: () => javaClient.get('/dashboard/low-stock-alerts'),
};

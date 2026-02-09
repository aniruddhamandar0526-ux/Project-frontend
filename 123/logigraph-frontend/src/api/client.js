import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),
  
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  ping: () => api.get('/auth/ping'),
};

// ==================== PRODUCT ENDPOINTS ====================
export const productAPI = {
  getAll: () => api.get('/catalog/products'),
  
  getById: (id) => api.get(`/catalog/products/${id}`),
  
  getBySku: (sku) => api.get(`/catalog/products/sku/${sku}`),
  
  create: (data) => api.post('/catalog/products', data),
  
  update: (id, data) => api.put(`/catalog/products/${id}`, data),
  
  delete: (id) => api.delete(`/catalog/products/${id}`),
};

// ==================== CUSTOMER ENDPOINTS ====================
export const customerAPI = {
  getAll: () => api.get('/customers'),
  
  getById: (id) => api.get(`/customers/${id}`),
  
  getByUserId: (userId) => api.get(`/customers/user/${userId}`),
  
  create: (data) => api.post('/customers', data),
  
  update: (id, data) => api.put(`/customers/${id}`, data),
  
  delete: (id) => api.delete(`/customers/${id}`),
};

// ==================== ORDER ENDPOINTS ====================
export const orderAPI = {
  // Customer Orders
  createOrder: (data) => api.post('/customer/orders', data),
  getMyOrders: (page = 0, size = 100) => api.get('/customer/orders', { params: { page, size } }),
  
  // Manager Orders
  getAll: (page = 0, size = 20) =>
    api.get('/manager/orders', { params: { page, size } }),
  
  getById: (id) => api.get(`/manager/orders/${id}`),
  // Customer-specific fetch by id
  getCustomerById: (id) => api.get(`/customer/orders/${id}`),
  
  getByTrackingId: (trackingId) =>
    api.get(`/manager/orders/tracking/${trackingId}`),
  
  getByCustomerId: (customerId, page = 0, size = 20) =>
    api.get(`/manager/orders/customer/${customerId}`, { params: { page, size } }),
  
  getByStatus: (status, page = 0, size = 20) =>
    api.get(`/manager/orders/status/${status}`, { params: { page, size } }),
  
  getItems: (id) => api.get(`/manager/orders/${id}/items`),
  
  getHistory: (id) => api.get(`/manager/orders/${id}/history`),
  
  updateStatus: (id, data) =>
    api.put(`/manager/orders/${id}/status`, data),
  
  cancel: (id, data) => api.post(`/manager/orders/${id}/cancel`, data),
};

// ==================== VEHICLE ENDPOINTS ====================
export const vehicleAPI = {
  getAll: (status) =>
    api.get('/manager/vehicles', { params: status ? { status } : {} }),
  
  create: (data) => api.post('/manager/vehicles', data),
  
  updateStatus: (id, data) =>
    api.put(`/manager/vehicles/${id}/status`, data),
  
  updateWarehouse: (id, data) =>
    api.put(`/manager/vehicles/${id}/warehouse`, data),
};

// ==================== WAREHOUSE ENDPOINTS ====================
export const warehouseAPI = {
  getAll: () => api.get('/warehouses/manager'),
  
  getById: (id) => api.get(`/warehouses/manager/${id}`),
  
  create: (data) => api.post('/warehouses/admin', data),
  
  update: (id, data) => api.put(`/warehouses/admin/${id}`, data),
};

// ==================== INVENTORY ENDPOINTS ====================
export const inventoryAPI = {
  getWarehouseInventory: (warehouseId) =>
    api.get(`/manager/inventory/warehouse/${warehouseId}`),
  
  addStock: (data) => api.post('/manager/inventory/add', data),
  
  adjustStock: (data) => api.post('/manager/inventory/adjust', data),
  
  // Helper: fetch all warehouse inventories (used by customer to check compatibility)
  getAllWarehouseInventories: async () => {
    const warehousesRes = await api.get('/warehouses/manager');
    const warehouses = warehousesRes.data || [];
    const inventoriesByWarehouse = {};
    for (const w of warehouses) {
      try {
        const invRes = await api.get(`/manager/inventory/warehouse/${w.id}`);
        inventoriesByWarehouse[w.id] = invRes.data || [];
      } catch (err) {
        console.warn(`Failed to fetch inventory for warehouse ${w.id}`, err);
        inventoriesByWarehouse[w.id] = [];
      }
    }
    return { warehouses, inventoriesByWarehouse };
  },
};

// ==================== DASHBOARD ENDPOINTS ====================
export const dashboardAPI = {
  getRecentOrders: () =>
    api.get('/manager/dashboard/orders/recent'),
  
  getOrdersByStatus: () =>
    api.get('/manager/dashboard/orders/status'),
  
  getFleetStatus: () =>
    api.get('/manager/dashboard/fleet/status'),
  
  getLowStockAlerts: (threshold = 10) =>
    api.get('/manager/dashboard/inventory/low-stock', {
      params: { threshold },
    }),
};

// ==================== TRACKING ENDPOINTS (.NET Backend) ====================
const trackingAPI = axios.create({
  baseURL: 'http://localhost:5160/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to tracking requests
trackingAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const trackingServiceAPI = {
  startTracking: (data) => trackingAPI.post('/tracking/start', data),
  
  getTracking: (orderId) => trackingAPI.get(`/tracking/order/${orderId}`),
};

export default api;

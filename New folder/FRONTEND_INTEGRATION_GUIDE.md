# LogiGraph Frontend Integration Guide

## 🎯 Complete Frontend Development Roadmap

---

## Phase 1: Project Setup & Authentication

### 1.1 Frontend Dependencies
```bash
npm install axios react-router-dom zustand
npm install leaflet react-leaflet  # for maps
npm install socket.io-client  # for real-time updates
npm install chart.js react-chartjs-2  # for dashboard charts
```

### 1.2 Create API Client Setup
```javascript
// src/api/client.js
import axios from 'axios';

const API_URL = 'http://localhost:8082';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error Interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

### 1.3 Authentication Service
```javascript
// src/api/authApi.js
import client from './client';

export const authApi = {
  login: (username, password) => 
    client.post('/api/auth/login', { username, password }),
  
  register: (username, password) => 
    client.post('/api/auth/register', { username, password }),
};
```

### 1.4 Auth Context/Store (Zustand)
```javascript
// src/store/authStore.js
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('authToken', token);
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### 1.5 Login Page
```jsx
// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authApi.login(username, password);
      setToken(data.token);
      navigate('/dashboard'); // or '/orders' for customer
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

---

## Phase 2: Core Features

### 2.1 Customer Module - Order Placement

#### API Service
```javascript
// src/api/orderApi.js
import client from './client';

export const orderApi = {
  // Customer placing order
  createOrder: (items, deliveryAddress, deliveryDate, estimatedDeliveryDays) =>
    client.post('/api/customer/orders', {
      items,
      deliveryAddress,
      deliveryDate,
      estimatedDeliveryDays,
    }),

  // Manager/Admin viewing orders
  getAllOrders: (page = 0, size = 20) =>
    client.get(`/api/manager/orders?page=${page}&size=${size}`),

  getOrderById: (orderId) =>
    client.get(`/api/manager/orders/${orderId}`),

  getOrdersByCustomer: (customerId, page = 0, size = 20) =>
    client.get(`/api/manager/orders/customer/${customerId}?page=${page}&size=${size}`),

  getOrderByTracking: (trackingId) =>
    client.get(`/api/manager/orders/tracking/${trackingId}`),

  updateOrderStatus: (orderId, status) =>
    client.put(`/api/manager/orders/${orderId}/status`, { status }),

  cancelOrder: (orderId, reason) =>
    client.post(`/api/manager/orders/${orderId}/cancel`, { reason }),

  getStatusHistory: (orderId) =>
    client.get(`/api/manager/orders/status-history/${orderId}`),
};
```

#### Product Service (for catalog)
```javascript
// src/api/productApi.js
import client from './client';

export const productApi = {
  getAllProducts: () =>
    client.get('/api/catalog/products'),

  getProductById: (productId) =>
    client.get(`/api/catalog/products/${productId}`),

  createProduct: (data) =>
    client.post('/api/catalog/products', data),

  updateProduct: (productId, data) =>
    client.put(`/api/catalog/products/${productId}`, data),
};
```

#### Create Order Component
```jsx
// src/pages/CustomerOrderPage.jsx
import { useState } from 'react';
import { orderApi } from '../api/orderApi';
import { productApi } from '../api/productApi';
import { useQuery, useMutation } from 'react-query';

export default function OrderPage() {
  const [items, setItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(2);

  // Fetch products for selection
  const { data: products } = useQuery('products', () =>
    productApi.getAllProducts().then(res => res.data)
  );

  // Create order mutation
  const createOrderMutation = useMutation(
    () => orderApi.createOrder(items, deliveryAddress, deliveryDate, estimatedDays),
    {
      onSuccess: (data) => {
        // Store trackingId and orderId
        localStorage.setItem('lastTrackingId', data.data.trackingId);
        localStorage.setItem('lastOrderId', data.data.id);
        // Navigate to tracking page
        window.location.href = `/track/${data.data.trackingId}`;
      },
      onError: (error) => {
        console.error('Order creation failed:', error.response?.data);
      },
    }
  );

  const handleAddItem = (productId) => {
    const product = products.find(p => p.id === productId);
    const existing = items.find(i => i.productId === productId);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ productId, quantity: 1 });
    }
    setItems([...items]);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    await createOrderMutation.mutate();
  };

  return (
    <div className="order-form">
      <h2>Place New Order</h2>
      
      <div className="products-section">
        <h3>Select Products</h3>
        {products?.map(product => (
          <div key={product.id} className="product-card">
            <div>{product.name} - ₹{product.price}</div>
            <button onClick={() => handleAddItem(product.id)}>Add to Order</button>
          </div>
        ))}
      </div>

      <div className="items-section">
        <h3>Order Items</h3>
        {items.map((item, idx) => {
          const product = products?.find(p => p.id === item.productId);
          return (
            <div key={idx} className="item-row">
              <span>{product?.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  item.quantity = parseInt(e.target.value);
                  setItems([...items]);
                }}
              />
              <span>₹{product?.price * item.quantity}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handlePlaceOrder}>
        <input
          type="text"
          placeholder="Delivery Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
        />
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Estimated delivery days"
          value={estimatedDays}
          onChange={(e) => setEstimatedDays(parseInt(e.target.value))}
        />
        <button type="submit" disabled={createOrderMutation.isLoading}>
          {createOrderMutation.isLoading ? 'Placing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
```

---

### 2.2 Order List Component (Manager/Admin)
```jsx
// src/pages/AdminOrderListPage.jsx
import { useState } from 'react';
import { orderApi } from '../api/orderApi';
import { useQuery } from 'react-query';

export default function AdminOrderListPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch orders with pagination
  const { data: orderPage, isLoading } = useQuery(
    ['orders', page],
    () => orderApi.getAllOrders(page, pageSize).then(res => res.data),
    { keepPreviousData: true }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="orders-list">
      <h2>All Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orderPage?.content?.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName}</td>
              <td className={`status-${order.status.toLowerCase()}`}>
                {order.status}
              </td>
              <td>₹{order.totalPrice}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <a href={`/orders/${order.id}`}>View</a>
                <a href={`/track/${order.trackingId}`}>Track</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => p - 1)} 
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1} of {orderPage?.pageable?.totalPages}</span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page >= orderPage?.pageable?.totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

### 2.3 Order Detail Component
```jsx
// src/pages/OrderDetailPage.jsx
import { useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { useQuery } from 'react-query';

export default function OrderDetailPage() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery(
    ['order', orderId],
    () => orderApi.getOrderById(orderId).then(res => res.data)
  );

  const { data: history } = useQuery(
    ['orderHistory', orderId],
    () => orderApi.getStatusHistory(orderId).then(res => res.data)
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="order-detail">
      <h2>Order #{order.id}</h2>
      
      <div className="order-header">
        <div>
          <strong>Customer:</strong> {order.customerName}
        </div>
        <div>
          <strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span>
        </div>
        <div>
          <strong>Tracking ID:</strong> {order.trackingId}
        </div>
        <div>
          <strong>Vehicle:</strong> {order.assignedVehicleId}
        </div>
      </div>

      <div className="order-items">
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice}</td>
                <td>₹{item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="order-total">
          <strong>Total: ₹{order.totalPrice}</strong>
        </div>
      </div>

      <div className="delivery-info">
        <h3>Delivery Information</h3>
        <div><strong>Address:</strong> {order.deliveryAddress}</div>
        <div><strong>Date:</strong> {order.deliveryDate}</div>
        <div><strong>Expected Days:</strong> {order.estimatedDeliveryDays}</div>
      </div>

      <div className="status-timeline">
        <h3>Status History</h3>
        {history?.statuses?.map((item, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-status">{item.status}</div>
            <div className="timeline-date">
              {new Date(item.changedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 3: Real-Time Tracking

### 3.1 Tracking Service Setup
```javascript
// src/api/trackingApi.js
import client from './client';

export const trackingApi = {
  getTrackingLocation: (orderId) =>
    client.get(`http://localhost:5160/api/tracking/order/${orderId}`),
};

// SignalR WebSocket Setup
import { HubConnectionBuilder } from '@signalr/signalr';

export const createTrackingConnection = (orderId) => {
  const connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5160/orderHub')
    .withAutomaticReconnect()
    .build();

  connection.start().catch(err => console.error('Connection failed:', err));

  // Join order tracking group
  connection.invoke('JoinOrder', orderId)
    .catch(err => console.error('JoinOrder failed:', err));

  return connection;
};
```

### 3.2 Tracking Map Component
```jsx
// src/components/TrackingMap.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createTrackingConnection, trackingApi } from '../api/trackingApi';

export default function TrackingMap({ orderId }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [isDelivered, setIsDelivered] = useState(false);

  useEffect(() => {
    // Get initial location
    trackingApi.getTrackingLocation(orderId)
      .then(res => {
        setLocation([res.data.currentLat, res.data.currentLng]);
        setStatus(res.data.status);
      })
      .catch(err => console.error('Failed to get tracking:', err));

    // Setup WebSocket connection
    const connection = createTrackingConnection(orderId);

    // Listen for location updates
    connection.on('locationUpdate', (data) => {
      setLocation([data.lat, data.lng]);
      setStatus(data.status);
    });

    // Listen for delivery completion
    connection.on('deliveryCompleted', (data) => {
      setIsDelivered(true);
      setStatus('DELIVERED');
      console.log('Order delivered:', data);
    });

    return () => {
      connection.stop();
    };
  }, [orderId]);

  if (!location) return <div>Loading location...</div>;

  return (
    <div className="tracking-container">
      <h2>Order #{orderId} Tracking</h2>
      <div className="status-badge">{status}</div>

      <MapContainer
        center={location}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={location}>
          <Popup>
            Current Location
            <br />
            Lat: {location[0].toFixed(4)}
            <br />
            Lng: {location[1].toFixed(4)}
            <br />
            Status: {status}
          </Popup>
        </Marker>
      </MapContainer>

      {isDelivered && (
        <div className="delivery-success">
          ✓ Order delivered successfully!
        </div>
      )}
    </div>
  );
}
```

---

## Phase 4: Dashboard & Analytics

### 4.1 Dashboard API Service
```javascript
// src/api/dashboardApi.js
import client from './client';

export const dashboardApi = {
  getRecentOrders: () =>
    client.get('/api/manager/dashboard/orders/recent'),

  getOrdersByStatus: () =>
    client.get('/api/manager/dashboard/orders/status'),

  getFleetStatus: () =>
    client.get('/api/manager/dashboard/fleet/status'),

  getLowStock: (threshold = 10) =>
    client.get(`/api/manager/dashboard/inventory/low-stock?threshold=${threshold}`),
};
```

### 4.2 Dashboard Page
```jsx
// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { useQuery } from 'react-query';
import { Bar, Pie } from 'react-chartjs-2';

export default function DashboardPage() {
  const { data: recentOrders } = useQuery('recentOrders', () =>
    dashboardApi.getRecentOrders().then(res => res.data)
  );

  const { data: orderStatuses } = useQuery('orderStatuses', () =>
    dashboardApi.getOrdersByStatus().then(res => res.data)
  );

  const { data: fleetStatus } = useQuery('fleetStatus', () =>
    dashboardApi.getFleetStatus().then(res => res.data)
  );

  const { data: lowStock } = useQuery('lowStock', () =>
    dashboardApi.getLowStock().then(res => res.data)
  );

  // Prepare chart data
  const statusChartData = {
    labels: Object.keys(orderStatuses || {}),
    datasets: [{
      label: 'Orders by Status',
      data: Object.values(orderStatuses || {}),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ],
    }],
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Orders by Status</h3>
          <Pie data={statusChartData} />
        </div>

        <div className="card">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map(order => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>{order.status}</td>
                  <td>₹{order.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Fleet Status</h3>
          <div className="fleet-list">
            {fleetStatus?.map(vehicle => (
              <div key={vehicle.vehicleId} className="fleet-item">
                <strong>{vehicle.registrationNumber}</strong>
                <div>Type: {vehicle.vehicleType}</div>
                <div>Status: <span className={`status-${vehicle.status.toLowerCase()}`}>
                  {vehicle.status}
                </span></div>
                {vehicle.currentOrderId && (
                  <div>Delivering Order: #{vehicle.currentOrderId}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Low Stock Alerts</h3>
          {lowStock?.length === 0 ? (
            <p>All items in stock</p>
          ) : (
            <div className="alerts">
              {lowStock?.map(item => (
                <div key={item.productId} className="alert">
                  <strong>{item.productName}</strong>
                  <div>Warehouse: {item.warehouseName}</div>
                  <div>Current: {item.currentQuantity}, Min: {item.reorderLevel}</div>
                  <div>Shortage: {item.shortage} units</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 5: Inventory Management

### 5.1 Inventory API Service
```javascript
// src/api/inventoryApi.js
import client from './client';

export const inventoryApi = {
  getWarehouseInventory: (warehouseId) =>
    client.get(`/api/manager/inventory/warehouse/${warehouseId}`),

  addStock: (warehouseId, productId, quantity) =>
    client.post('/api/manager/inventory/add', {
      warehouseId,
      productId,
      quantity,
    }),

  adjustStock: (warehouseId, productId, delta) =>
    client.post('/api/manager/inventory/adjust', {
      warehouseId,
      productId,
      delta,
    }),
};
```

### 5.2 Inventory Management Component
```jsx
// src/pages/InventoryPage.jsx
import { useState } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { useQuery, useMutation, useQueryClient } from 'react-query';

export default function InventoryPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(1);
  const [addForm, setAddForm] = useState({ productId: '', quantity: '' });
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery(
    ['inventory', selectedWarehouse],
    () => inventoryApi.getWarehouseInventory(selectedWarehouse).then(res => res.data)
  );

  const addStockMutation = useMutation(
    () => inventoryApi.addStock(
      selectedWarehouse,
      parseInt(addForm.productId),
      parseInt(addForm.quantity)
    ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        setAddForm({ productId: '', quantity: '' });
      },
    }
  );

  const handleAddStock = (e) => {
    e.preventDefault();
    addStockMutation.mutate();
  };

  return (
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      <div className="warehouse-selector">
        <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(parseInt(e.target.value))}>
          <option value={1}>Mumbai Central</option>
          <option value={2}>Delhi Hub</option>
          <option value={3}>Bangalore Depot</option>
        </select>
      </div>

      <div className="add-stock-form">
        <h3>Add Stock</h3>
        <form onSubmit={handleAddStock}>
          <input
            type="number"
            placeholder="Product ID"
            value={addForm.productId}
            onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={addForm.quantity}
            onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
            required
          />
          <button type="submit" disabled={addStockMutation.isLoading}>
            Add Stock
          </button>
        </form>
      </div>

      <div className="inventory-list">
        <h3>Current Stock</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Last Restocked</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map(item => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td>{item.productSku}</td>
                <td>{item.quantity}</td>
                <td>{item.reorderLevel}</td>
                <td>
                  {item.quantity < item.reorderLevel ? (
                    <span className="low-stock">LOW</span>
                  ) : (
                    <span className="ok">OK</span>
                  )}
                </td>
                <td>{new Date(item.lastRestockedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Phase 6: Vehicle Fleet Management

### 6.1 Vehicle API Service
```javascript
// src/api/vehicleApi.js
import client from './client';

export const vehicleApi = {
  getAllVehicles: () =>
    client.get('/api/manager/vehicles'),

  getVehiclesByStatus: (status) =>
    client.get(`/api/manager/vehicles?status=${status}`),

  registerVehicle: (data) =>
    client.post('/api/manager/vehicles', data),

  updateVehicleStatus: (vehicleId, status) =>
    client.put(`/api/manager/vehicles/${vehicleId}/status`, { status }),

  updateVehicleWarehouse: (vehicleId, warehouseId) =>
    client.put(`/api/manager/vehicles/${vehicleId}/warehouse`, { warehouseId }),
};
```

### 6.2 Vehicle Management Component
```jsx
// src/pages/VehiclePage.jsx
import { useState } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { useQuery, useMutation, useQueryClient } from 'react-query';

export default function VehiclePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: vehicles } = useQuery(
    ['vehicles', statusFilter],
    () => statusFilter
      ? vehicleApi.getVehiclesByStatus(statusFilter).then(res => res.data)
      : vehicleApi.getAllVehicles().then(res => res.data)
  );

  const updateStatusMutation = useMutation(
    ({ vehicleId, status }) => vehicleApi.updateVehicleStatus(vehicleId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vehicles']);
      },
    }
  );

  const handleStatusChange = (vehicleId, newStatus) => {
    updateStatusMutation.mutate({ vehicleId, status: newStatus });
  };

  return (
    <div className="vehicle-page">
      <h2>Fleet Management</h2>

      <div className="filters">
        <label>Filter by Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="ON_DELIVERY">On Delivery</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="vehicles-grid">
        {vehicles?.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <h3>{vehicle.registrationNumber}</h3>
            <div><strong>Type:</strong> {vehicle.vehicleType}</div>
            <div><strong>Capacity:</strong> {vehicle.capacity} kg</div>
            <div>
              <strong>Status:</strong>
              <select
                value={vehicle.currentStatus}
                onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div><strong>Warehouse:</strong> {vehicle.assignedWarehouse}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 7: Customer & Product Management (Admin)

### 7.1 Customer API Service
```javascript
// src/api/customerApi.js
import client from './client';

export const customerApi = {
  getAllCustomers: () =>
    client.get('/api/customers'),

  getCustomerById: (customerId) =>
    client.get(`/api/customers/${customerId}`),

  createCustomer: (data) =>
    client.post('/api/customers', data),

  updateCustomer: (customerId, data) =>
    client.put(`/api/customers/${customerId}`, data),
};
```

### 7.2 Warehouse API Service
```javascript
// src/api/warehouseApi.js
import client from './client';

export const warehouseApi = {
  getAllWarehouses: () =>
    client.get('/api/warehouses/manager'),

  getWarehouseById: (id) =>
    client.get(`/api/warehouses/manager/${id}`),

  createWarehouse: (data) =>
    client.post('/api/warehouses/admin', data),

  updateWarehouse: (id, data) =>
    client.put(`/api/warehouses/admin/${id}`, data),
};
```

---

## 📁 Recommended Frontend Folder Structure

```
src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── orderApi.js
│   ├── productApi.js
│   ├── trackingApi.js
│   ├── dashboardApi.js
│   ├── inventoryApi.js
│   ├── vehicleApi.js
│   ├── customerApi.js
│   └── warehouseApi.js
├── components/
│   ├── Layout.jsx
│   ├── Navigation.jsx
│   ├── TrackingMap.jsx
│   ├── OrderForm.jsx
│   ├── OrderList.jsx
│   └── ...
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CustomerOrderPage.jsx
│   ├── AdminOrderListPage.jsx
│   ├── OrderDetailPage.jsx
│   ├── TrackingPage.jsx
│   ├── InventoryPage.jsx
│   ├── VehiclePage.jsx
│   ├── CustomerPage.jsx
│   └── WarehousePage.jsx
├── store/
│   ├── authStore.js
│   ├── orderStore.js
│   └── ...
├── styles/
│   ├── global.css
│   ├── dashboard.css
│   ├── orders.css
│   └── ...
├── App.jsx
└── main.jsx
```

---

## 🔐 Protected Routes Example

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

---

## 🚀 Development Workflow

1. Start Java backend on port 8082
2. Start .NET tracking service on port 5160
3. Start MySQL on port 3306
4. Run frontend dev server: `npm run dev`
5. Test endpoints using provided API documentation
6. Implement features in phases as listed above

---

## ✅ Testing Checklist

- [ ] Login/Logout works
- [ ] JWT token stored and sent correctly
- [ ] Order creation succeeds
- [ ] Order list pagination works
- [ ] Real-time tracking updates show
- [ ] Dashboard charts render correctly
- [ ] Inventory CRUD works
- [ ] Vehicle management works
- [ ] Error handling displays properly
- [ ] Mobile responsive design works


# 🎯 FRONTEND QUICK START - Backend API Integration Guide

**For:** React Frontend Development  
**Backend Status:** ✅ Complete & Ready  
**Created:** February 9, 2026

---

## 🚀 BEFORE YOU START

### Prerequisites
- [ ] Backend running: `http://localhost:8080`
- [ ] .NET Tracking running: `http://localhost:5001`
- [ ] MySQL database running and schema applied
- [ ] Test: `http://localhost:8080/api/auth/ping` returns success

### Dependencies to Install
```bash
npm install axios          # HTTP client
npm install @microsoft/signalr  # WebSocket client
npm install react-router-dom    # Routing
npm install zustand          # State management (optional)
```

---

## 📋 ESSENTIAL API ENDPOINTS

### Authentication (No JWT needed)
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/ping
```

### Customer Orders (JWT Required)
```
POST /api/customer/orders              # Place order
GET  /api/customer/orders              # Get my orders
GET  /api/customer/orders/{orderId}    # Get detail
```

### Real-Time Tracking (WebSocket)
```
WebSocket: ws://localhost:5001/hubs/orders
Events: locationUpdate, deliveryCompleted
```

### Products (Public)
```
GET /api/catalog/products
GET /api/catalog/products/{productId}
```

### Dashboard (Manager only)
```
GET /api/dashboard/orders/recent
GET /api/dashboard/fleet/status
GET /api/dashboard/metrics
```

---

## 🔐 AUTHENTICATION SETUP

### 1. Create API Service
```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080'
});

// Add JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

### 2. Create Auth Context
```javascript
// src/context/AuthContext.jsx
import { createContext, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));

  const login = async (username, password) => {
    try {
      const { data } = await API.post('/api/auth/login', {
        username,
        password
      });
      
      localStorage.setItem('jwtToken', data.token);
      setToken(data.token);
      setUser({ username, role: data.role });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      await API.post('/api/auth/register', {
        username,
        password
      });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 📦 PLACE ORDER

### API Call
```javascript
// src/services/orderService.js
import API from './api';

export const placeOrder = async (items, destLat, destLng) => {
  try {
    const { data } = await API.post('/api/customer/orders', {
      items,  // [{productId: 1, quantity: 2}, ...]
      destLat,
      destLng
    });
    
    return {
      orderId: data.id,
      trackingId: data.trackingId,
      status: data.status
    };
  } catch (error) {
    throw error;
  }
};

export const getMyOrders = async () => {
  const { data } = await API.get('/api/customer/orders');
  return data.orders || data;
};

export const getOrderDetail = async (orderId) => {
  const { data } = await API.get(`/api/customer/orders/${orderId}`);
  return data;
};
```

### React Component
```javascript
// src/components/OrderForm.jsx
import { useState } from 'react';
import { placeOrder } from '../services/orderService';

export function OrderForm({ items, onOrderPlaced }) {
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await placeOrder(items, destLat, destLng);
      onOrderPlaced(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Delivery Latitude"
        value={destLat}
        onChange={(e) => setDestLat(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Delivery Longitude"
        value={destLng}
        onChange={(e) => setDestLng(e.target.value)}
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Placing...' : 'Place Order'}
      </button>
    </form>
  );
}
```

---

## 🗺️ REAL-TIME TRACKING

### WebSocket Service
```javascript
// src/services/trackingService.js
import * as signalR from '@microsoft/signalr';

let connection = null;

export const connectTracking = async (jwtToken) => {
  try {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5001/hubs/orders', {
        accessTokenFactory: () => jwtToken
      })
      .withAutomaticReconnect()
      .build();

    await connection.start();
    console.log('Connected to tracking hub');
    return connection;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

export const joinOrderTracking = async (orderId) => {
  if (connection) {
    await connection.invoke('JoinOrderGroup', orderId);
  }
};

export const onLocationUpdate = (callback) => {
  if (connection) {
    connection.on('locationUpdate', callback);
  }
};

export const onDeliveryCompleted = (callback) => {
  if (connection) {
    connection.on('deliveryCompleted', callback);
  }
};

export const disconnectTracking = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};
```

### React Component
```javascript
// src/components/TrackingMap.jsx
import { useEffect, useState } from 'react';
import {
  connectTracking,
  joinOrderTracking,
  onLocationUpdate,
  onDeliveryCompleted
} from '../services/trackingService';

export function TrackingMap({ orderId, token }) {
  const [location, setLocation] = useState(null);
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    const setup = async () => {
      // Connect to WebSocket
      await connectTracking(token);
      
      // Join order group
      await joinOrderTracking(orderId);
      
      // Listen for location updates
      onLocationUpdate((data) => {
        console.log('Location:', data.lat, data.lng);
        setLocation({ lat: data.lat, lng: data.lng });
        // Update map marker here
      });
      
      // Listen for delivery completion
      onDeliveryCompleted((data) => {
        console.log('Order delivered!', data.orderId);
        setDelivered(true);
      });
    };

    setup();

    return () => {
      // Cleanup on unmount
    };
  }, [orderId, token]);

  if (delivered) {
    return <div className="success">Order Delivered! ✅</div>;
  }

  if (!location) {
    return <div>Waiting for tracking...</div>;
  }

  return (
    <div className="map">
      <p>Vehicle at: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
      {/* Render map here with location marker */}
    </div>
  );
}
```

---

## 📊 FETCH PRODUCTS

### API Call
```javascript
// src/services/productService.js
import API from './api';

export const getProducts = async () => {
  const { data } = await API.get('/api/catalog/products');
  return data.products || data;
};

export const getProductById = async (productId) => {
  const { data } = await API.get(`/api/catalog/products/${productId}`);
  return data;
};
```

### React Component
```javascript
// src/components/ProductList.jsx
import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>SKU: {product.sku}</p>
          <p>Price: ${product.unitPrice}</p>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ ERROR HANDLING

### Common Errors

**401 Unauthorized**
```javascript
// Token expired or invalid
// → Already handled in API interceptor
// → Redirects to login page automatically
```

**400 Bad Request**
```javascript
// Example: Insufficient inventory
try {
  await placeOrder(items, lat, lng);
} catch (error) {
  if (error.response?.status === 400) {
    const details = error.response.data.details;
    console.log('Order error:', details);
    // Show user-friendly message
  }
}
```

**Network Error**
```javascript
// No internet or server down
try {
  await API.get('/api/customer/orders');
} catch (error) {
  if (!error.response) {
    console.error('Network error - server unreachable');
    showError('Server is unreachable. Please try again later.');
  }
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Week 1 (Foundation)
- [ ] Setup API client with axios
- [ ] Implement AuthContext
- [ ] Create Login component
- [ ] Create Register component
- [ ] Test authentication endpoints
- [ ] Implement JWT storage

### Week 2 (Orders)
- [ ] Fetch and display products
- [ ] Create shopping cart
- [ ] Build order form
- [ ] Test order placement API
- [ ] Store orderId and trackingId
- [ ] Display order list

### Week 3 (Real-Time)
- [ ] Setup WebSocket connection
- [ ] Test tracking connection
- [ ] Implement location updates
- [ ] Add map integration
- [ ] Handle delivery completion
- [ ] Test reconnection logic

### Week 4 (Polish)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Performance optimization
- [ ] User testing
- [ ] Bug fixes

---

## 📞 DEBUGGING TIPS

### Check Backend is Running
```bash
curl http://localhost:8080/api/auth/ping
# Should respond with: "Auth controller is reachable!"
```

### Test API Endpoint with Curl
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### Check WebSocket Connection
```javascript
console.log(connection.state);  // Should be 'Connected'
```

### Verify JWT Token
```javascript
const token = localStorage.getItem('jwtToken');
console.log(token);  // Should be non-empty string
```

---

## 🚀 QUICK START TEMPLATE

```javascript
// App.jsx
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main>
          {/* Your routes here */}
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📚 MORE INFORMATION

For complete details, see:
- **BACKEND_ANALYSIS_SUMMARY.md** - Overview
- **BACKEND_API_QUICK_REFERENCE.md** - All endpoints
- **FRONTEND_IMPLEMENTATION_ROADMAP.md** - Full plan

---

**Happy Coding! 🎉**

# Frontend Implementation Roadmap

**Objective:** Complete LogiGraph frontend development based on backend analysis  
**Current Status:** 60% complete (13 pages, core features working)  
**Target:** 100% complete with real-time tracking and customer features

---

## PHASE 1: CRITICAL FIXES (Est. 1-2 Days)

### Task 1.1: Add Missing `fetchMyOrders()` Function
**File:** `src/api/orderApi.js`  
**Issue:** CustomerDashboard.jsx calls `fetchMyOrders()` but function doesn't exist  
**Fix:**
```javascript
export async function fetchMyOrders() {
  const response = await axiosInstance.get("/customer/orders");
  return response.data;
}
```
**Impact:** ✅ CustomerDashboard will work immediately  
**Verification:** Check that endpoint `/api/customer/orders` exists in Java backend

---

### Task 1.2: Fix OrderTimeline Component
**File:** `src/pages/OrderTimeline.jsx`  
**Issue:** Currently shows hardcoded mockup #LG-102394, no real data  
**Current Code:**
```javascript
// Hardcoded order
<h2>Order #LG-102394</h2>
```

**Fix:**
```javascript
import { useParams } from "react-router-dom";
import { fetchOrderDetails, fetchOrderHistory } from "../api/orderApi";

function OrderTimeline() {
  const { orderId } = useParams(); // Get from URL param
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [orderData, historyData] = await Promise.all([
          fetchOrderDetails(orderId),
          fetchOrderHistory(orderId)
        ]);
        setOrder(orderData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to load order timeline", err);
      }
    }
    loadData();
  }, [orderId]);
  
  return (
    <AppLayout>
      <h1>Order Lifecycle</h1>
      {order && (
        <div>
          <h2>Order #{order.orderId}</h2>
          {/* Render timeline from history data */}
          {history.map((h) => (
            <TimelineStep key={h.id} {...h} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
```

**Update App.jsx Route:**
```javascript
<Route path="/order-timeline/:orderId" element={<ProtectedRoute><OrderTimeline /></ProtectedRoute>} />
```

**Impact:** ✅ Dynamic order timelines  
**Note:** Need to link from OrderDetails page: `<Link to={`/order-timeline/${orderId}`}>`

---

### Task 1.3: Verify Role Detection in Backend
**File:** Backend JWT claims  
**Issue:** `jwtUtils.js` relies on username prefix, `roleUtils.js` looks for JWT `role` field  
**Check:**
- [ ] Decode JWT in browser DevTools: `atob(token.split('.')[1])`
- [ ] Verify JWT payload contains `role: "ADMIN" | "MANAGER" | "CUSTOMER"`
- [ ] OR verify username follows pattern: "admin*", "manager*"

**Backend Fix (if needed):**
```java
// In LoginController.java
Map<String, Object> claims = new HashMap<>();
claims.put("role", user.getRole()); // ADMIN | MANAGER | CUSTOMER
String token = createJwt(user.getId(), claims);
return new LoginResponse(token);
```

**Impact:** ✅ Reliable role-based authorization  
**Verification:** Dashboard should show correct role in AppLayout footer

---

## PHASE 2: HIGH-IMPACT FEATURES (Est. 3-5 Days)

### Task 2.1: Customer Order Creation Form
**File:** Create `src/pages/CustomerOrderCreation.jsx`  
**Endpoint:** POST /api/customer/orders

**Requirements:**
```javascript
POST /api/customer/orders
{
  "items": [
    { "productId": 1, "quantity": 5 },
    { "productId": 2, "quantity": 10 }
  ],
  "deliveryAddress": "123 Main St, City, ZIP"
}
```

**Implementation Steps:**
1. Fetch products from `/api/catalog/products`
2. Create product selection interface
3. Allow quantity input per product
4. Collect delivery address
5. Submit to backend
6. Redirect to `/customer/dashboard` on success

**Code Structure:**
```javascript
import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { fetchProducts } from "../api/productApi";
import { createOrder } from "../api/orderApi"; // Add this function

function CustomerOrderCreation() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);
  
  async function handleSubmit(e) {
    e.preventDefault();
    const items = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId: parseInt(productId), quantity }));
    
    if (items.length === 0) {
      alert("Select at least one product");
      return;
    }
    
    try {
      await createOrder({ items, deliveryAddress });
      alert("Order created successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      alert("Failed to create order");
    }
  }
  
  return (
    <AppLayout>
      <h1>Create Order</h1>
      <form onSubmit={handleSubmit}>
        {/* Product Selection */}
        <div className="mb-6">
          <h2>Select Products</h2>
          {products.map((p) => (
            <div key={p.id} className="flex gap-4 mb-2">
              <span>{p.name}</span>
              <input
                type="number"
                min="0"
                value={selectedItems[p.id] || 0}
                onChange={(e) => setSelectedItems({
                  ...selectedItems,
                  [p.id]: parseInt(e.target.value) || 0
                })}
              />
            </div>
          ))}
        </div>
        
        {/* Delivery Address */}
        <textarea
          placeholder="Delivery address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
          className="w-full p-2 border rounded mb-4"
        />
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Place Order
        </button>
      </form>
    </AppLayout>
  );
}
```

**Update orderApi.js:**
```javascript
export async function createOrder(orderData) {
  const response = await axiosInstance.post("/customer/orders", orderData);
  return response.data;
}
```

**Update App.jsx:**
```javascript
<Route path="/customer/create-order" element={
  <ProtectedRoute><CustomerOrderCreation /></ProtectedRoute>
} />
```

**Update AppLayout.jsx (Customer Nav):**
```javascript
{role === "CUSTOMER" && (
  <>
    <NavItem to="/customer/dashboard" label="My Orders" />
    <NavItem to="/customer/create-order" label="Place Order" />
    <NavItem to="/order-timeline/:orderId" label="Track Order" />
  </>
)}
```

**Impact:** ✅ Customers can now place orders  
**Testing:** Create order as CUSTOMER user, verify in admin Orders page

---

### Task 2.2: Real-Time Tracking with WebSocket
**File:** Create `src/pages/RealTimeTracking.jsx`  
**Endpoint:** WebSocket ws://localhost:5160/hub/order-tracking

**Requirements:**
1. Connect to .NET SignalR hub
2. Subscribe to order tracking events
3. Display map with vehicle location
4. Update location in real-time
5. Show estimated delivery time

**Implementation Steps:**

**Step 1: Install dependencies**
```bash
npm install @aspnet/signalr
npm install leaflet react-leaflet
```

**Step 2: Create WebSocket service**
```javascript
// src/api/trackingApi.js
import * as signalR from "@aspnet/signalr";

export function createTrackingConnection(orderId) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5160/hub/order-tracking")
    .withAutomaticReconnect()
    .build();
  
  return connection;
}

export async function startTracking(connection) {
  try {
    await connection.start();
    console.log("Connected to tracking hub");
  } catch (err) {
    console.error("Connection failed:", err);
    setTimeout(() => startTracking(connection), 5000); // Retry
  }
}
```

**Step 3: Create RealTimeTracking component**
```javascript
// src/pages/RealTimeTracking.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { createTrackingConnection, startTracking } from "../api/trackingApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

function RealTimeTracking() {
  const { orderId } = useParams();
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [connection, setConnection] = useState(null);
  
  useEffect(() => {
    const conn = createTrackingConnection(orderId);
    
    // Handle tracking updates
    conn.on("LocationUpdate", (data) => {
      setLocation({ lat: data.latitude, lng: data.longitude });
    });
    
    conn.on("StatusUpdate", (newStatus) => {
      setStatus(newStatus);
    });
    
    startTracking(conn).then(() => {
      setConnection(conn);
      // Request initial location
      conn.invoke("GetCurrentLocation", orderId);
    });
    
    return () => {
      conn.stop();
    };
  }, [orderId]);
  
  return (
    <AppLayout>
      <h1>Track Order #{orderId}</h1>
      <p>Status: {status}</p>
      
      {location && (
        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "500px" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>Vehicle Location</Popup>
          </Marker>
        </MapContainer>
      )}
    </AppLayout>
  );
}
```

**Update App.jsx:**
```javascript
<Route path="/order/:orderId/tracking" element={
  <ProtectedRoute><RealTimeTracking /></ProtectedRoute>
} />
```

**Link from OrderDetails or CustomerDashboard:**
```javascript
<Link to={`/order/${orderId}/tracking`} className="text-blue-600">Track Live</Link>
```

**Impact:** ✅ Real-time order tracking  
**Testing:** Place order, track from customer dashboard

---

### Task 2.3: Product Catalog Page for Customers
**File:** Create `src/pages/ProductCatalog.jsx`  
**Endpoint:** GET /api/catalog/products

**Implementation:**
```javascript
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { fetchProducts } from "../api/productApi";

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);
  
  return (
    <AppLayout>
      <h1>Product Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-gray-600 text-sm">{p.description}</p>
            <p className="text-lg font-bold mt-2">${p.price}</p>
            <p className="text-gray-500 text-sm">Stock: {p.quantity}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
```

**Update AppLayout.jsx:**
```javascript
{role === "CUSTOMER" && (
  <>
    <NavItem to="/products" label="Products" />
    <NavItem to="/customer/create-order" label="Place Order" />
  </>
)}
```

**Update App.jsx:**
```javascript
<Route path="/products" element={
  <ProtectedRoute><ProductCatalog /></ProtectedRoute>
} />
```

**Impact:** ✅ Customers can browse products  
**Enhancement:** Add cart functionality, wishlist, product details

---

## PHASE 3: UX IMPROVEMENTS (Est. 2-3 Days)

### Task 3.1: Dashboard Visualizations
**Enhancement:** Replace text KPIs with charts

**Install Recharts:**
```bash
npm install recharts
```

**Update Dashboard.jsx:**
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Transform order data for chart
const orderTrendData = [
  { date: "Mon", orders: 12 },
  { date: "Tue", orders: 19 },
  { date: "Wed", orders: 15 },
  // ... more data
];

// In return JSX:
<LineChart width={600} height={300} data={orderTrendData}>
  <CartesianGrid />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="orders" stroke="#8884d8" />
</LineChart>
```

**Impact:** ✅ Professional dashboard  
**Enhancement:** Pie chart for order status distribution, bar chart for vehicle utilization

---

### Task 3.2: Toast Notifications
**Install React Hot Toast:**
```bash
npm install react-hot-toast
```

**Update main.jsx:**
```javascript
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster />
      <Router>...</Router>
    </>
  );
}
```

**Usage in components:**
```javascript
import toast from 'react-hot-toast';

async function handleSubmit() {
  try {
    await updateOrder(data);
    toast.success("Order updated successfully!");
  } catch (err) {
    toast.error("Failed to update order");
  }
}
```

**Apply to all forms:**
- Login.jsx
- OrderDetails.jsx
- Vehicles.jsx
- Inventory.jsx
- CustomerProfileSetup.jsx

**Impact:** ✅ Better user feedback  

---

### Task 3.3: Loading Spinners
**Use Lucide React spinner:**

```javascript
import { Loader2 } from "lucide-react";

{loading && <Loader2 className="animate-spin" />}
```

**Replace all "Loading..." text with spinner icon**

**Impact:** ✅ Professional loading states

---

## PHASE 4: POLISH & TESTING (Est. 1-2 Days)

### Task 4.1: Pagination UI
**Enhance Orders.jsx and other list pages**

```javascript
function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>{page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
        Next
      </button>
    </div>
  );
}
```

### Task 4.2: Search & Filter
**Add to Orders.jsx:**

```javascript
const [statusFilter, setStatusFilter] = useState("");
const [searchId, setSearchId] = useState("");

const filtered = orders.filter(o =>
  (!statusFilter || o.status === statusFilter) &&
  (!searchId || o.orderId.includes(searchId))
);
```

### Task 4.3: Unit Tests
**Create test files:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Example: Login.test.jsx**
```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "./Login";

test("logs in user", async () => {
  render(<Login />);
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "admin1" } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass" } });
  fireEvent.click(screen.getByText("Sign in"));
  
  // Assert redirect happened
});
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes
- [ ] Add `fetchMyOrders()` to orderApi.js
- [ ] Fix OrderTimeline.jsx with real data
- [ ] Verify backend JWT includes role field
- [ ] Test CustomerDashboard with real orders

### Phase 2: High-Impact Features
- [ ] Create CustomerOrderCreation.jsx
- [ ] Add createOrder() to orderApi.js
- [ ] Set up WebSocket connection
- [ ] Create RealTimeTracking.jsx
- [ ] Enhance productApi.js
- [ ] Create ProductCatalog.jsx
- [ ] Update AppLayout navigation
- [ ] Test customer order flow end-to-end

### Phase 3: UX Improvements
- [ ] Install and configure Recharts
- [ ] Create dashboard charts
- [ ] Install React Hot Toast
- [ ] Add toast notifications throughout
- [ ] Replace "Loading..." with spinner icons
- [ ] Test all notification scenarios

### Phase 4: Polish
- [ ] Add pagination UI to list pages
- [ ] Add search/filter controls
- [ ] Create unit tests for key components
- [ ] Test on mobile devices
- [ ] Performance optimization

---

## TIMELINE SUMMARY

| Phase | Duration | Status | Output |
|-------|----------|--------|--------|
| Phase 1 | 1-2 days | Ready | Bug fixes, role verification |
| Phase 2 | 3-5 days | Ready | Order creation, real-time tracking, catalog |
| Phase 3 | 2-3 days | Ready | Charts, notifications, better UX |
| Phase 4 | 1-2 days | Ready | Polish, testing, optimization |
| **Total** | **7-12 days** | **Ready** | **100% complete frontend** |

---

## SUCCESS CRITERIA

✅ All 13 pages fully functional  
✅ All backend endpoints integrated  
✅ Real-time tracking working  
✅ Customer order creation working  
✅ Dashboard with visualizations  
✅ Error handling with toast notifications  
✅ Mobile responsive  
✅ Unit tests passing  
✅ No console errors  
✅ Performance optimized  

---

**Document Status:** Ready for Implementation  
**Last Updated:** Current Session  
**Next Step:** Begin Phase 1 fixes


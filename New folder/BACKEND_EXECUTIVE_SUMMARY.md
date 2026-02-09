# LogiGraph Backend Analysis - EXECUTIVE SUMMARY

## 🎯 Overview

LogiGraph is a **full-stack logistics management platform** with:
- **Java Spring Boot** backend (Port 8082) - Core business logic
- **.NET ASP.NET Core** services (Port 5160/5161) - Real-time tracking
- **MySQL database** - Data persistence
- **SignalR WebSocket** - Live location updates

---

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────┐
│      Frontend (React/Vue)            │
│   (To be developed)                  │
└─────────────────────────────────────┘
        ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│ Java Spring Boot │  │  .NET Services   │
│   (Port 8082)    │  │ (Port 5160/5161) │
└──────────────────┘  └──────────────────┘
      ↓ MySQL              ↓ SignalR
   (Data)            (Real-time Updates)
```

---

## 🔷 JAVA BACKEND - Complete Feature List

### 1. **Authentication Module** `/api/auth`
- User registration & login
- JWT token generation (24-hour expiry)
- Role-based access: ADMIN, MANAGER, CUSTOMER

### 2. **Order Management** `/api/customer/orders` & `/api/manager/orders`
- **Customers:** Place orders with items, delivery address, estimated date
- **Managers/Admins:** View all orders, search by customer/tracking ID, update status
- **Status Flow:** PENDING → ASSIGNED → IN_TRANSIT → DELIVERED → COMPLETED
- **Cancellation:** Orders can be cancelled at any stage
- **Status History:** Track all status changes with timestamps

### 3. **Customer Management** `/api/customers`
- Create customer profiles (Admin only)
- Update customer details
- View customer information
- One customer per user mapping

### 4. **Product Catalog** `/api/catalog/products`
- Browse all products
- Product details with SKU, price, category
- Create/Update products (Admin only)
- SKU is unique and immutable

### 5. **Warehouse Management** `/api/warehouses`
- Create and manage distribution centers
- View warehouse details, capacity, location (lat/lng)
- Admin operations for creation/updates
- Manager access for viewing

### 6. **Inventory Management** `/api/manager/inventory`
- Track stock by product and warehouse
- Add stock to warehouses
- Adjust inventory (increase/decrease)
- Low-stock alerts and reorder levels
- Real-time inventory tracking during orders

### 7. **Vehicle Fleet Management** `/api/manager/vehicles`
- Register vehicles with registration number, type, capacity
- Track vehicle status (ACTIVE, INACTIVE, MAINTENANCE, ON_DELIVERY)
- Assign vehicles to warehouses
- Auto-assignment when orders are placed
- Fleet overview and monitoring

### 8. **Dashboard & Analytics** `/api/manager/dashboard`
- Recent orders summary
- Orders breakdown by status
- Fleet status overview
- Low-stock alerts with threshold configuration
- Real-time metrics for decision making

### 9. **Integration Layer** `/internal/tracking`
- Callback from .NET service when delivery completes
- Updates order status to DELIVERED
- Releases vehicle for next assignment

---

## 🟠 .NET BACKEND - Real-Time Tracking Features

### Tracking Service (Port 5160 & 5161)
- **In-memory session management** for active tracking
- **Movement simulation** - 20 steps, 2 seconds per step (40 second total journey)
- **Real-time location broadcasts** via SignalR WebSocket
- **Automatic delivery detection** and completion callbacks

### Key Endpoints:
```
POST /api/tracking/start              Start tracking for an order
GET  /api/tracking/order/{orderId}    Get current location
WS   /orderHub                        WebSocket for live updates
     → locationUpdate                 Lat/lng every 2 seconds
     → deliveryCompleted              When delivery finishes
```

### SignalR WebSocket Integration:
- Clients join order-specific groups
- Receive location updates in real-time
- Get notified when delivery is complete
- No polling needed (push-based)

---

## 🔐 Authentication & Authorization

### JWT Token System:
```json
{
  "sub": "username",
  "role": "CUSTOMER|MANAGER|ADMIN",
  "customerId": 10,
  "iat": 1707391800,
  "exp": 1707478200
}
```

### Role Permissions:
| Operation | ADMIN | MANAGER | CUSTOMER |
|-----------|-------|---------|----------|
| Create Products | ✅ | ❌ | ❌ |
| Create Warehouses | ✅ | ❌ | ❌ |
| Register Vehicles | ✅ | ❌ | ❌ |
| Manage Customers | ✅ | ❌ | ❌ |
| View All Orders | ✅ | ✅ | ❌ |
| Update Order Status | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ❌ |
| **Place Orders** | ❌ | ❌ | ✅ |
| **Track Own Orders** | ❌ | ❌ | ✅ |

---

## 📡 Data Flow Examples

### Order Placement Flow:
```
1. Customer submits order form
   POST /api/customer/orders
   
2. Java Service:
   - Finds nearest warehouse with stock
   - Reserves inventory
   - Creates Order (status = PENDING)
   - Assigns available vehicle (status = ASSIGNED)
   - Commits transaction
   
3. Auto-trigger Tracking:
   - Calls .NET: POST /api/tracking/start
   - Returns trackingId to customer
   
4. .NET Service:
   - Creates tracking session
   - Starts 20-step movement simulation
   - Broadcasts location every 2 seconds
   - When complete: calls Java /internal/tracking/delivered
   
5. Java Service:
   - Updates Order status to DELIVERED
   - Releases vehicle for next order
   - Marks tracking as complete
```

### Real-Time Tracking Flow:
```
1. Customer has trackingId from order
2. Frontend connects to WebSocket: ws://localhost:5160/orderHub
3. Client invokes: connection.invoke("JoinOrder", orderId)
4. Receives events:
   - locationUpdate: {lat, lng, status} every 2 seconds
   - deliveryCompleted: {orderId, deliveredAt}
5. Frontend displays live map with location marker
6. Shows success message when delivery complete
```

---

## 🗂️ Database Schema Overview

### MySQL Tables:
- `users` - Authentication (username, password, role)
- `customers` - Customer profiles
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Items per order (junction)
- `order_status_history` - Status change audit trail
- `warehouses` - Distribution centers
- `inventory` - Product stock by warehouse
- `vehicles` - Fleet management
- `vehicle_assignments` - Vehicle to order mapping

### Connection Details:
```
Host: localhost
Port: 3306
Database: logigraph_db
User: root
Password: root
```

---

## 🚀 Key Integration Points for Frontend

### 1. Authentication Flow:
```
Login → Get JWT → Store in localStorage
→ Send in Authorization header for all requests
→ Refresh/re-login when token expires (401)
```

### 2. Order Management:
```
Customer Form → POST /api/customer/orders
→ Get trackingId & orderId
→ Store in state/store
→ Redirect to tracking page
```

### 3. Real-Time Tracking:
```
Connect WebSocket → Join order group
→ Receive location updates every 2 sec
→ Update map marker in real-time
→ Show delivery notification on completion
```

### 4. Dashboard Metrics:
```
Fetch dashboard endpoints on page load
→ Display charts with Chart.js/Recharts
→ Set up auto-refresh or WebSocket updates
→ Show alerts for low stock, pending orders
```

### 5. Inventory Management:
```
View warehouse stock → POST /add or /adjust
→ Invalidate query cache
→ Show updated inventory
→ Trigger alerts if below reorder level
```

---

## 📋 Complete Endpoint Summary

### Auth (6 endpoints)
✅ Register, Login, Ping

### Orders (10 endpoints)
✅ Create (customer), List (admin), Get details, Search by customer/tracking, Update status, Cancel, Status history

### Customers (4 endpoints)
✅ Create, Update, Get, List

### Products (4 endpoints)
✅ Create, Update, Get, List

### Warehouses (4 endpoints)
✅ Create, Update, Get, List

### Inventory (3 endpoints)
✅ Add stock, Adjust stock, View warehouse inventory

### Vehicles (4 endpoints)
✅ Register, Update status, Change warehouse, List

### Dashboard (4 endpoints)
✅ Recent orders, Orders by status, Fleet status, Low stock

### Tracking (.NET) (3 endpoints)
✅ Start tracking, Get location, Health check (ping)

### WebSocket (1 hub)
✅ OrderTrackingHub with locationUpdate & deliveryCompleted events

### Integration (1 endpoint)
✅ Delivery completion callback

**TOTAL: ~44 API endpoints + WebSocket**

---

## 🎓 Frontend Development Roadmap

### Phase 1: Setup & Auth
- Configure API client with JWT interceptor
- Build login/register pages
- Setup authentication store (Zustand/Redux)

### Phase 2: Core Order Features
- Order creation form with product selection
- Order list with pagination
- Order detail view with items and history
- Order status filtering and search

### Phase 3: Real-Time Tracking
- Map integration (Leaflet/Google Maps)
- WebSocket connection setup
- Live location marker updates
- Delivery completion notification

### Phase 4: Dashboard
- Chart.js/Recharts integration
- Orders by status breakdown
- Fleet status overview
- Low stock alerts

### Phase 5: Inventory & Fleet
- Warehouse inventory management
- Add/adjust stock forms
- Vehicle fleet view and status updates
- Warehouse management (for admins)

### Phase 6: Admin Features
- Customer profile management
- Product catalog CRUD
- Warehouse creation/updates
- Vehicle registration

### Phase 7: Polish & Testing
- Error handling & validation
- Loading states & skeletons
- Mobile responsive design
- Unit & integration tests

---

## 🔑 Important Configuration Notes

### Java Application Config
```properties
Server Port: 8082
Database: MySQL localhost:3306
Tracking Service: http://localhost:5160
JWT Expiry: 24 hours
```

### .NET Service Config
```json
Ports: 5160, 5161
Java API Base: http://localhost:8082
Shared Secret: logigraph_super_secret_shared_key_32_chars_min
Service JWT Expiry: 5 minutes
```

### Database
```
MySQL Connection: localhost:3306
Database: logigraph_db
Credentials: root/root
```

---

## ⚠️ Critical Implementation Notes

1. **JWT Token Storage:** Store in localStorage, include in all requests (except login/register)

2. **CORS:** Frontend will need to handle CORS - Java service likely has CORS enabled for localhost:3000

3. **WebSocket Connection:** Must include orderId when joining tracking group, receive pushes don't need polling

4. **Pagination:** Always use query params `page=0&size=20` for list endpoints

5. **Error Handling:** 401 = re-login, 403 = insufficient permissions, 4xx = validation errors

6. **Real-time Updates:** 
   - Orders auto-assigned when vehicles available
   - Tracking auto-starts after order commitment
   - Location updates push every 2 seconds
   - Delivery auto-completes after 40 seconds

7. **Database Consistency:** 
   - Inventory reserved during order placement
   - Not committed until order is finalized
   - Vehicle status updated to ON_DELIVERY when assigned

---

## 📚 Documentation Files Created

1. **BACKEND_ANALYSIS.md** - Complete detailed analysis (this file is comprehensive)
2. **BACKEND_QUICK_REFERENCE.md** - Quick API lookup guide
3. **BACKEND_DATA_MODELS.md** - All request/response schemas
4. **FRONTEND_INTEGRATION_GUIDE.md** - Step-by-step implementation guide with code examples

---

## 🎯 Next Steps

1. **Review** all 4 documentation files
2. **Setup** frontend project structure
3. **Implement** Phase 1 (Auth) from Frontend Integration Guide
4. **Test** each endpoint as you implement
5. **Build** features in the recommended phases
6. **Deploy** when all phases complete

---

## 📞 Quick Support Reference

**Java Service Down?** 
→ Check port 8082, run `mvn spring-boot:run`

**Tracking Not Working?**
→ Check port 5160, verify JWT token, check WebSocket connection

**Database Issues?**
→ Verify MySQL running on 3306, check credentials root/root

**CORS Errors?**
→ Check frontend and backend origin URLs match

**JWT Expired?**
→ Auto-redirect to login on 401, refresh token or re-login

---

## ✅ Backend Status

| Component | Status | Port | Purpose |
|-----------|--------|------|---------|
| Java Spring Boot | ✅ Ready | 8082 | Core Logic |
| .NET Tracking | ✅ Ready | 5160 | Real-time Updates |
| MySQL Database | ✅ Ready | 3306 | Data Storage |
| SignalR WebSocket | ✅ Ready | 5160 | Push Updates |

**All backend components are fully functional and documented.**

**Frontend is ready to be built following the provided integration guide.**

---

**Prepared:** February 8, 2026  
**Project:** LogiGraph  
**Status:** Backend Analysis Complete - Ready for Frontend Development


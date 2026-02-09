# LogiGraph Backend - Quick Reference Guide

## 🎯 At A Glance

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **Core Backend** | Java Spring Boot | 8082 | Orders, Inventory, Customers, Products |
| **Tracking Service #1** | .NET ASP.NET Core | 5160 | Real-time delivery tracking (MongoDB) |
| **Tracking Service #2** | .NET ASP.NET Core | 5161 | Real-time delivery tracking (in-memory) |
| **Database** | MySQL | 3306 | User, Customer, Order, Inventory, Product data |

---

## 📍 Main API Endpoints By Feature

### 🔐 Authentication
```
POST   /api/auth/login               → Get JWT token
POST   /api/auth/register            → Create account
GET    /api/auth/ping                → Health check
```

### 🛍️ Order Management
```
# Customer placing order
POST   /api/customer/orders          → Create new order

# Manager viewing orders
GET    /api/manager/orders           → List all orders (paginated)
GET    /api/manager/orders/{id}      → Get order details
GET    /api/manager/orders/customer/{customerId}  → Customer's orders
GET    /api/manager/orders/tracking/{trackingId}  → Find by tracking ID
PUT    /api/manager/orders/{id}/status            → Update status
POST   /api/manager/orders/{id}/cancel            → Cancel order
GET    /api/manager/orders/status-history/{id}   → View status timeline
```

### 🚗 Real-Time Tracking (.NET)
```
POST   /api/tracking/start           → Start tracking (Java calls this)
GET    /api/tracking/order/{orderId} → Get current location
WS     /orderHub                     → WebSocket for live updates
  → on("locationUpdate")             → Receive lat/lng every 2 sec
  → on("deliveryCompleted")          → Delivery finished event
```

### 📦 Inventory Management
```
POST   /api/manager/inventory/add     → Add stock to warehouse
POST   /api/manager/inventory/adjust  → Adjust inventory (delta)
GET    /api/manager/inventory/warehouse/{id}  → View stock
```

### 🏭 Warehouse Management
```
POST   /api/warehouses/admin         → Create warehouse (ADMIN)
PUT    /api/warehouses/admin/{id}    → Update warehouse (ADMIN)
GET    /api/warehouses/manager       → List warehouses
GET    /api/warehouses/manager/{id}  → Get warehouse details
```

### 🚙 Vehicle Fleet Management
```
POST   /api/manager/vehicles         → Register vehicle
GET    /api/manager/vehicles         → List all vehicles
PUT    /api/manager/vehicles/{id}/status     → Update status
PUT    /api/manager/vehicles/{id}/warehouse  → Change warehouse
```

### 📦 Product Catalog
```
POST   /api/catalog/products         → Create product (ADMIN)
PUT    /api/catalog/products/{id}    → Update product (ADMIN)
GET    /api/catalog/products         → List products
GET    /api/catalog/products/{id}    → Get product details
```

### 👥 Customer Management
```
POST   /api/customers                → Create customer (ADMIN)
PUT    /api/customers/{id}           → Update customer (ADMIN)
GET    /api/customers                → List customers
GET    /api/customers/{id}           → Get customer details
```

### 📊 Dashboard & Analytics
```
GET    /api/manager/dashboard/orders/recent       → Recent orders
GET    /api/manager/dashboard/orders/status       → Orders by status count
GET    /api/manager/dashboard/fleet/status        → Fleet overview
GET    /api/manager/dashboard/inventory/low-stock → Low stock alerts
```

---

## 🔄 Request/Response Examples

### 1. User Login
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Place Order (Customer)
```bash
curl -X POST http://localhost:8082/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "items": [
      {"productId": 101, "quantity": 2},
      {"productId": 102, "quantity": 1}
    ],
    "deliveryAddress": "123 Main St, City",
    "deliveryDate": "2026-02-15",
    "estimatedDeliveryDays": 2
  }'

# Response (201 CREATED):
{
  "id": 5001,
  "customerId": 10,
  "status": "ASSIGNED",
  "totalPrice": 150000.00,
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "createdAt": "2026-02-08T10:30:00Z"
}
```

### 3. Get Order Details (Manager)
```bash
curl -X GET http://localhost:8082/api/manager/orders/5001 \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Response (200 OK):
{
  "id": 5001,
  "customerId": 10,
  "customerName": "John Doe",
  "status": "IN_TRANSIT",
  "totalPrice": 150000.00,
  "items": [...],
  "assignedVehicleId": 201,
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "deliveryAddress": "123 Main St",
  "statusHistory": [...]
}
```

### 4. View Dashboard Analytics
```bash
curl -X GET "http://localhost:8082/api/manager/dashboard/orders/status" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Response (200 OK):
{
  "PENDING": 5,
  "ASSIGNED": 8,
  "IN_TRANSIT": 12,
  "DELIVERED": 25,
  "COMPLETED": 100,
  "CANCELLED": 2
}
```

### 5. Start Tracking (.NET) - Auto called by Java
```bash
curl -X POST http://localhost:5160/api/tracking/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {SERVICE_JWT}" \
  -d '{
    "orderId": 5001,
    "vehicleId": 201,
    "startLat": 19.0176,
    "startLng": 73.0055,
    "destLat": 19.0760,
    "destLng": 72.8777,
    "averageSpeedKmph": 40
  }'

# Response (200 OK):
{
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "status": "STARTED"
}
```

### 6. Get Current Tracking Location
```bash
curl -X GET http://localhost:5160/api/tracking/order/5001

# Response (200 OK):
{
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "orderId": 5001,
  "vehicleId": 201,
  "currentLat": 19.0450,
  "currentLng": 72.9000,
  "status": "IN_TRANSIT"
}
```

---

## 🔑 Authentication Details

### JWT Token Structure
```json
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "john_doe",
  "username": "john_doe",
  "role": "CUSTOMER",
  "customerId": 10,
  "iat": 1707391800,
  "exp": 1707478200
}
```

### How to Use JWT
1. Login: Get token from `/api/auth/login`
2. Store: Save in localStorage
3. Send: Include in all API calls:
   ```
   Authorization: Bearer {token}
   ```

### Service-to-Service JWT (Java ↔ .NET)
- Secret: `logigraph_super_secret_shared_key_32_chars_min`
- Issuer: `logigraph-core`
- Audience: `logigraph-tracking`
- Expiration: 5 minutes

---

## 🔗 Database Connection Details

### MySQL
```
Host: localhost
Port: 3306
Database: logigraph_db
Username: root
Password: root
```

### Key Tables
- `users` → Authentication
- `customers` → Customer profiles
- `orders` → Order records
- `order_items` → Items in orders
- `products` → Product catalog
- `warehouses` → Distribution centers
- `inventory` → Stock tracking
- `vehicles` → Fleet data

---

## 🎭 Role-Based Access

| Feature | ADMIN | MANAGER | CUSTOMER |
|---------|-------|---------|----------|
| Create Products | ✅ | ❌ | ❌ |
| Create Warehouses | ✅ | ❌ | ❌ |
| Create Customers | ✅ | ❌ | ❌ |
| Register Vehicles | ✅ | ❌ | ❌ |
| View All Orders | ✅ | ✅ | ❌ |
| Update Order Status | ✅ | ✅ | ❌ |
| Manage Inventory | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ❌ |
| Place Orders | ❌ | ❌ | ✅ |
| Track Own Orders | ❌ | ❌ | ✅ |

---

## 🚀 Frontend Integration Checklist

### Phase 1: Setup
- [ ] Setup axios/fetch with JWT interceptor
- [ ] Setup localStorage for token storage
- [ ] Create auth guard/middleware

### Phase 2: Core Features
- [ ] Login/Register pages
- [ ] Dashboard (for managers/admins)
- [ ] Order creation form (for customers)
- [ ] Order list/detail pages

### Phase 3: Inventory & Fleet
- [ ] Inventory management UI
- [ ] Warehouse management
- [ ] Vehicle fleet view

### Phase 4: Real-Time Tracking
- [ ] Map integration
- [ ] WebSocket connection setup
- [ ] Live location updates
- [ ] Real-time status notifications

### Phase 5: Analytics
- [ ] Dashboard charts
- [ ] Report generation
- [ ] Export functionality

---

## 🔗 API Base URLs

| Service | Base URL |
|---------|----------|
| Java Backend | `http://localhost:8082` |
| .NET Tracking (Dev) | `http://localhost:5160` or `http://localhost:5161` |
| Database | `localhost:3306` |

---

## 📝 Common Query Parameters

### Pagination
```
?page=0&size=20&sort=id,desc
```

### Filters
```
?status=PENDING
?warehouseId=1
?customerId=10
```

### Dashboard
```
?threshold=10  (for low-stock alerts)
```

---

## 🛠️ Troubleshooting

### "401 Unauthorized"
→ JWT token expired or invalid
→ Re-login to get new token

### "403 Forbidden"
→ User role doesn't have permission
→ Check RBAC table above

### "404 Not Found"
→ Resource doesn't exist
→ Verify ID in database

### "400 Bad Request"
→ Invalid request payload
→ Check required fields and data types

### Tracking not starting
→ Verify .NET service is running on port 5160
→ Check JWT token is valid
→ Check orderIds match between systems

---

## 📞 Support Notes

- **Java Service Main:** 8082
- **Real-time Tracking:** 5160/5161
- **Database:** MySQL on 3306
- **All times in UTC**
- **Orders auto-assigned on creation if vehicles available**
- **Tracking simulation takes ~40 seconds (20 steps × 2 sec each)**


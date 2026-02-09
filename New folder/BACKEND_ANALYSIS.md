# LogiGraph Backend Architecture Analysis

## 📋 Executive Summary

LogiGraph is a **microservices-based logistics management system** with two distinct backend components:
- **Java (Spring Boot)** - Core business logic, orders, inventory, vehicles, customers
- **.NET (ASP.NET Core)** - Real-time tracking and delivery simulation

Both services communicate via REST APIs and share JWT authentication. The frontend should integrate with these backends to provide a complete supply chain management experience.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React/Vue)                   │
└─────────────────────────────────────────────────────────┘
              ↓                                    ↓
    ┌──────────────────┐          ┌──────────────────────┐
    │  Java Service    │          │  .NET Services       │
    │  (Port 8082)     │◄────────►│  (Port 5160 + 5161)  │
    └──────────────────┘          └──────────────────────┘
         │  MySQL DB                  │  In-Memory Session
         │  (logigraph_db)           │  (SignalR WebSocket)
```

---

## 🔵 JAVA BACKEND (Spring Boot)

**Port:** 8082
**Database:** MySQL (`logigraph_db`)
**Database Connection:** `jdbc:mysql://localhost:3306/logigraph_db` (user: `root`, pass: `root`)

### Core Modules

#### 1. **AUTH MODULE** 
**Path:** `/api/auth`
**Purpose:** User authentication and JWT token generation

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | ❌ No | Register new user |
| `/api/auth/login` | POST | ❌ No | Login & get JWT token |
| `/api/auth/ping` | GET | ❌ No | Health check |

**Request/Response Examples:**

**Login:**
```json
POST /api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. **CUSTOMER MODULE**
**Path:** `/api/customers`
**Purpose:** Manage customer profiles and customer-to-user mapping

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/customers` | POST | ✅ JWT | ADMIN | Create new customer profile |
| `/api/customers/{customerId}` | PUT | ✅ JWT | ADMIN | Update customer details |
| `/api/customers/{customerId}` | GET | ✅ JWT | ADMIN, MANAGER | Get customer details |
| `/api/customers` | GET | ✅ JWT | ADMIN, MANAGER | List all customers |

**Key Business Logic:**
- One customer per user
- Customer has: name, phone, address, userId
- Only ADMIN can create/manage customers

---

#### 3. **ORDER MODULE**
**Path:** `/api/customer/orders` & `/api/manager/orders`
**Purpose:** Order placement, management, and tracking

##### Customer Order Endpoints (Self-service)
**Path:** `/api/customer/orders`

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/customer/orders` | POST | ✅ JWT | CUSTOMER | Place a new order |

**Place Order Flow:**
```
1. Customer calls POST /api/customer/orders with:
   - Items: [{productId, quantity}, ...]
   - DeliveryAddress
   - DeliveryDate

2. OrderPlacementService orchestrates:
   - Finds nearest warehouse with stock
   - Reserves inventory
   - Creates order with status: PENDING
   - Assigns vehicle (AFTER commit)
   - Triggers Java→.NET tracking start call

3. Returns: OrderResponse with orderId, trackingId
```

**Request Example:**
```json
POST /api/customer/orders
Authorization: Bearer {JWT_TOKEN}
{
  "items": [
    {
      "productId": 101,
      "quantity": 2
    },
    {
      "productId": 102,
      "quantity": 1
    }
  ],
  "deliveryAddress": "123 Main St, City",
  "deliveryDate": "2026-02-15",
  "estimatedDeliveryDays": 2
}

Response: 201 CREATED
{
  "id": 5001,
  "customerId": 10,
  "status": "ASSIGNED",
  "totalPrice": 15000.00,
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:30:05Z",
  "trackingId": "TRK-a1b2c3d4e5f6g7h8"
}
```

---

##### Manager/Admin Order Endpoints
**Path:** `/api/manager/orders`

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/manager/orders` | GET | ✅ JWT | ADMIN, MANAGER | Get all orders (paginated) |
| `/api/manager/orders/{orderId}` | GET | ✅ JWT | ADMIN, MANAGER | Get order details |
| `/api/manager/orders/customer/{customerId}` | GET | ✅ JWT | ADMIN, MANAGER | Get customer's orders |
| `/api/manager/orders/tracking/{trackingId}` | GET | ✅ JWT | ADMIN, MANAGER | Get order by tracking ID |
| `/api/manager/orders/{orderId}/status` | PUT | ✅ JWT | ADMIN, MANAGER | Update order status |
| `/api/manager/orders/{orderId}/cancel` | POST | ✅ JWT | ADMIN, MANAGER | Cancel order |
| `/api/manager/orders/status-history/{orderId}` | GET | ✅ JWT | ADMIN, MANAGER | Get order status history |

**Order Status Lifecycle:**
```
PENDING → ASSIGNED → IN_TRANSIT → DELIVERED → COMPLETED
  ↓
CANCELLED (can happen at any stage)
```

**Get Order Details Example:**
```json
GET /api/manager/orders/5001
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "id": 5001,
  "customerId": 10,
  "customerName": "John Doe",
  "status": "IN_TRANSIT",
  "totalPrice": 15000.00,
  "items": [
    {
      "productId": 101,
      "productName": "Laptop",
      "quantity": 2,
      "unitPrice": 50000.00,
      "totalPrice": 100000.00
    }
  ],
  "assignedVehicleId": 201,
  "trackingId": "TRK-a1b2c3d4e5f6g7h8",
  "deliveryAddress": "123 Main St",
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:35:00Z",
  "statusHistory": [
    {
      "status": "PENDING",
      "changedAt": "2026-02-08T10:30:00Z"
    },
    {
      "status": "ASSIGNED",
      "changedAt": "2026-02-08T10:30:05Z"
    },
    {
      "status": "IN_TRANSIT",
      "changedAt": "2026-02-08T10:35:00Z"
    }
  ]
}
```

---

#### 4. **INVENTORY MODULE**
**Path:** `/api/manager/inventory` & `/api/warehouses`
**Purpose:** Warehouse management and stock control

##### Inventory Management
**Path:** `/api/manager/inventory`

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/manager/inventory/add` | POST | ✅ JWT | ADMIN, MANAGER | Add stock to warehouse |
| `/api/manager/inventory/adjust` | POST | ✅ JWT | ADMIN, MANAGER | Adjust stock (delta) |
| `/api/manager/inventory/warehouse/{warehouseId}` | GET | ✅ JWT | ADMIN, MANAGER | Get warehouse inventory |

**Add Stock Example:**
```json
POST /api/manager/inventory/add
Authorization: Bearer {JWT_TOKEN}
{
  "warehouseId": 1,
  "productId": 101,
  "quantity": 500
}

Response: 201 CREATED
```

---

##### Warehouse Management
**Path:** `/api/warehouses`

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/warehouses/admin` | POST | ✅ JWT | ADMIN | Create warehouse |
| `/api/warehouses/admin/{id}` | PUT | ✅ JWT | ADMIN | Update warehouse |
| `/api/warehouses/manager` | GET | ✅ JWT | ADMIN, MANAGER | Get all warehouses |
| `/api/warehouses/manager/{id}` | GET | ✅ JWT | ADMIN, MANAGER | Get warehouse details |

**Create Warehouse Example:**
```json
POST /api/warehouses/admin
Authorization: Bearer {JWT_TOKEN}
{
  "warehouseName": "Mumbai Central",
  "location": "Navi Mumbai",
  "latitude": 19.0176,
  "longitude": 73.0055,
  "capacity": 10000
}

Response: 201 CREATED
{
  "id": 1,
  "warehouseName": "Mumbai Central",
  "location": "Navi Mumbai",
  "latitude": 19.0176,
  "longitude": 73.0055,
  "capacity": 10000
}
```

---

#### 5. **VEHICLE MODULE**
**Path:** `/api/manager/vehicles`
**Purpose:** Fleet management and vehicle assignments

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/manager/vehicles` | POST | ✅ JWT | ADMIN | Register new vehicle |
| `/api/manager/vehicles` | GET | ✅ JWT | ADMIN, MANAGER | Get all vehicles |
| `/api/manager/vehicles/{vehicleId}/status` | PUT | ✅ JWT | ADMIN, MANAGER | Update vehicle status |
| `/api/manager/vehicles/{vehicleId}/warehouse` | PUT | ✅ JWT | ADMIN, MANAGER | Change vehicle warehouse |

**Vehicle Status Values:**
```
ACTIVE, INACTIVE, MAINTENANCE, ON_DELIVERY
```

**Register Vehicle Example:**
```json
POST /api/manager/vehicles
Authorization: Bearer {JWT_TOKEN}
{
  "registrationNumber": "DL-01-AB-1234",
  "vehicleType": "TRUCK",
  "capacity": 5000,
  "warehouseId": 1
}

Response: 201 CREATED
{
  "id": 201,
  "registrationNumber": "DL-01-AB-1234",
  "vehicleType": "TRUCK",
  "capacity": 5000,
  "currentStatus": "ACTIVE",
  "assignedWarehouse": "Mumbai Central"
}
```

---

#### 6. **PRODUCT CATALOG**
**Path:** `/api/catalog/products`
**Purpose:** Product information management

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/catalog/products` | POST | ✅ JWT | ADMIN | Create product |
| `/api/catalog/products/{productId}` | PUT | ✅ JWT | ADMIN | Update product |
| `/api/catalog/products/{productId}` | GET | ✅ JWT | ADMIN, MANAGER, CUSTOMER | Get product details |
| `/api/catalog/products` | GET | ✅ JWT | ADMIN, MANAGER, CUSTOMER | List all products |

**Create Product Example:**
```json
POST /api/catalog/products
Authorization: Bearer {JWT_TOKEN}
{
  "name": "Laptop Pro",
  "sku": "LAPTOP-001",
  "description": "High-performance laptop",
  "price": 50000.00,
  "category": "Electronics"
}

Response: 201 CREATED
{
  "id": 101,
  "name": "Laptop Pro",
  "sku": "LAPTOP-001",
  "description": "High-performance laptop",
  "price": 50000.00,
  "category": "Electronics"
}
```

---

#### 7. **DASHBOARD**
**Path:** `/api/manager/dashboard`
**Purpose:** Provide operational insights and metrics

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/manager/dashboard/orders/recent` | GET | ✅ JWT | ADMIN, MANAGER | Get recent orders |
| `/api/manager/dashboard/orders/status` | GET | ✅ JWT | ADMIN, MANAGER | Orders by status breakdown |
| `/api/manager/dashboard/fleet/status` | GET | ✅ JWT | ADMIN, MANAGER | Fleet status overview |
| `/api/manager/dashboard/inventory/low-stock` | GET | ✅ JWT | ADMIN, MANAGER | Low stock alerts (threshold param) |

**Dashboard Example:**
```json
GET /api/manager/dashboard/orders/status
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "PENDING": 5,
  "ASSIGNED": 8,
  "IN_TRANSIT": 12,
  "DELIVERED": 25,
  "COMPLETED": 100,
  "CANCELLED": 2
}
```

---

#### 8. **INTEGRATION: Tracking Callbacks**
**Path:** `/internal/tracking`
**Purpose:** Receive delivery completion events from .NET service

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/internal/tracking/delivered` | POST | ✅ SERVICE | Handle delivery completion callback |

**When .NET service completes delivery:**
```json
POST /internal/tracking/delivered
Authorization: Bearer {SERVICE_JWT_TOKEN}
{
  "orderId": 5001,
  "vehicleId": 201
}

Response: 200 OK
```

---

#### 9. **TEST ENDPOINTS**
| Endpoint | Purpose |
|----------|---------|
| `/test/hello` | Health check |
| `/test/echo` | Echo test |

---

## 🟠 .NET BACKEND (ASP.NET Core)

**Two Services:**
- **LogiGraph.Tracking** (Port 5160)
- **LogiGraph.Realtime** / dotnet dumb (Port 5161)

Both handle real-time location tracking and delivery simulation.

### Architecture

#### Real-Time Tracking Service
**Base URL:** `http://localhost:5160`

#### Core Features:
1. **Start Tracking** - Initialize location tracking for an order
2. **Get Tracking** - Query current location of a delivery
3. **Movement Simulation** - Simulates vehicle movement in 20 steps
4. **SignalR WebSocket** - Push location updates to clients in real-time

---

### Endpoints

#### 1. **Start Tracking**
**Path:** `/api/tracking/start`

```
POST /api/tracking/start
Authorization: Bearer {SERVICE_JWT_TOKEN}

{
  "orderId": 5001,
  "vehicleId": 201,
  "startLat": 19.0176,        // Warehouse latitude
  "startLng": 73.0055,        // Warehouse longitude
  "destLat": 19.0760,         // Destination latitude
  "destLng": 72.8777,         // Destination longitude
  "averageSpeedKmph": 40      // For simulation timing
}

Response: 200 OK
{
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "status": "STARTED"
}
```

**What Happens:**
1. Creates in-memory tracking session
2. Starts async movement simulation
3. Broadcasts location updates every 2 seconds via SignalR
4. After 20 steps, marks as DELIVERED
5. Sends callback to Java: `POST /internal/tracking/delivered`

---

#### 2. **Get Tracking Status**
**Path:** `/api/tracking/order/{orderId}`

```
GET /api/tracking/order/5001

Response: 200 OK
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

#### 3. **Health Check**
**Path:** `/ping`

```
GET /ping

Response: 200 OK
{
  "message": "pong"
}
```

---

### SignalR WebSocket Integration

**Hub:** `OrderTrackingHub`
**Connection URL:** `ws://localhost:5160/orderHub` or similar

#### Client-Side WebSocket Flow:

```javascript
// 1. Connect to SignalR Hub
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5160/orderHub")
    .build();

// 2. Join order tracking group
connection.invoke("JoinOrder", orderId);

// 3. Listen for location updates
connection.on("locationUpdate", (data) => {
    console.log(`New location: ${data.lat}, ${data.lng}`);
    // Update map with new marker
});

// 4. Listen for delivery completion
connection.on("deliveryCompleted", (data) => {
    console.log(`Order ${data.orderId} delivered`);
    // Show success message
});
```

---

### Service-to-Service Authentication

**JWT Token Flow (Java → .NET):**

```
1. Java generates SERVICE JWT with:
   - Issuer: "logigraph-core"
   - Audience: "logigraph-tracking"
   - Secret: "logigraph_super_secret_shared_key_32_chars_min"
   - Expires: 5 minutes

2. Java includes token in Authorization header:
   Authorization: Bearer {SERVICE_JWT_TOKEN}

3. .NET validates token signature and claims
```

---

## 🔐 Authentication & Authorization

### JWT Token Claims (User Login)

```json
{
  "sub": "john_doe",
  "username": "john_doe",
  "role": "CUSTOMER",
  "customerId": 10,
  "iat": 1707391800,
  "exp": 1707478200,
  "iss": "logigraph-auth",
  "aud": "logigraph-app"
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **ADMIN** | All endpoints except customer-specific ones |
| **MANAGER** | View/manage orders, vehicles, inventory, dashboard |
| **CUSTOMER** | Place orders, view own order history, track own shipments |

---

## 📊 Data Flow Diagram

### Order Placement Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│  POST /api/customer/orders                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Java Spring Boot Service                        │
│                      (Port 8082)                                 │
│                                                                  │
│  OrderPlacementService.placeOrder()                              │
│  1. Find warehouse with stock                                    │
│  2. Reserve inventory                                            │
│  3. Create Order (status = PENDING)                              │
│  4. Assign available vehicle                                     │
│  5. Commit transaction                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                 ┌────────────────────────┐
                 │   Call .NET Service    │
                 │  POST /api/tracking/   │
                 │  start (with JWT)      │
                 └────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                .NET Real-time Service                            │
│                   (Port 5160)                                    │
│                                                                  │
│  TrackingService.StartTracking()                                 │
│  1. Create tracking session in memory                            │
│  2. Start movement simulation (20 steps)                         │
│  3. Broadcast updates every 2 sec via SignalR                   │
│  4. When complete: POST /internal/tracking/delivered             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Frontend receives:
                    - trackingId
                    - Real-time location updates
                    - Delivery status
```

---

## 🎯 Frontend Integration Points

### By Feature:

#### 1. **Login/Registration**
- **Endpoint:** `POST /api/auth/login`
- **Frontend Screen:** Login page
- **Store:** JWT token in localStorage
- **Use:** Include in all subsequent requests

#### 2. **Dashboard (for Managers/Admins)**
- **Endpoints:**
  - `GET /api/manager/dashboard/orders/status`
  - `GET /api/manager/dashboard/fleet/status`
  - `GET /api/manager/dashboard/inventory/low-stock`
- **Frontend Screen:** Analytics/Reports page
- **Display:** Charts, metrics, alerts

#### 3. **Order Management (Customers)**
- **Create Order:**
  - `POST /api/customer/orders`
  - Form: Product selection, quantity, delivery address
- **View Orders:**
  - Query `GET /api/manager/orders` (if manager)
  - Or `GET /api/customer/orders` endpoint (if customer - needs implementation)

#### 4. **Real-Time Tracking (Customers)**
- **Start Tracking:** Call `.NET /api/tracking/start` after order creation
- **WebSocket:** Connect to SignalR hub
- **Display:** Map with live location, ETA

#### 5. **Inventory Management (Managers)**
- **View:** `GET /api/manager/inventory/warehouse/{id}`
- **Add Stock:** `POST /api/manager/inventory/add`
- **Adjust:** `POST /api/manager/inventory/adjust`

#### 6. **Vehicle Management (Managers)**
- **Fleet View:** `GET /api/manager/vehicles`
- **Update Status:** `PUT /api/manager/vehicles/{id}/status`
- **Change Warehouse:** `PUT /api/manager/vehicles/{id}/warehouse`

#### 7. **Customer Management (Admins)**
- **Create:** `POST /api/customers`
- **Update:** `PUT /api/customers/{id}`
- **View:** `GET /api/customers`

#### 8. **Product Catalog**
- **Browse:** `GET /api/catalog/products`
- **Details:** `GET /api/catalog/products/{id}`
- **Manage:** Create/Update (admin only)

#### 9. **Warehouse Management (Admins)**
- **View:** `GET /api/warehouses/manager`
- **Create:** `POST /api/warehouses/admin`
- **Update:** `PUT /api/warehouses/admin/{id}`

---

## 🔄 Inter-Service Communication

### Java → .NET
**When:** Order is placed and vehicle is assigned
**What:** `POST http://localhost:5160/api/tracking/start`
**Auth:** SERVICE JWT token
**Purpose:** Start real-time tracking

### .NET → Java
**When:** Delivery is completed (after 20 simulation steps)
**What:** `POST http://localhost:8082/internal/tracking/delivered`
**Auth:** SERVICE JWT token
**Purpose:** Update order status to DELIVERED, release vehicle

---

## 📝 Common Response Formats

### Success Response (200 OK)
```json
{
  "id": 5001,
  "status": "SUCCESS",
  "data": { /* actual data */ }
}
```

### Error Response (4xx/5xx)
```json
{
  "timestamp": "2026-02-08T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid order items",
  "path": "/api/customer/orders"
}
```

### Paginated Response
```json
{
  "content": [ /* array of items */ ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 150
  }
}
```

---

## 🚀 Environment Configuration

### Java Application
**File:** `application.properties`
```properties
server.port=8082
spring.datasource.url=jdbc:mysql://localhost:3306/logigraph_db
tracking.service.base-url=http://localhost:5160
```

### .NET Services
**File:** `appsettings.json`
```json
{
  "JavaApi": {
    "BaseUrl": "http://localhost:8082"
  }
}
```

---

## ⚙️ Database Schema Overview

### MySQL (Java Backend)

**Key Tables:**
- `users` - Authentication
- `customers` - Customer profiles
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Items in each order
- `order_status_history` - Status changes
- `warehouses` - Distribution centers
- `inventory` - Stock by warehouse
- `vehicles` - Fleet management

---

## 🎓 Summary for Frontend Development

### Required API Knowledge:
1. **Authentication flow** → Login to get JWT
2. **Role-based UI rendering** → Show/hide features based on role
3. **Order management** → Create, view, update status
4. **Real-time tracking** → WebSocket for live location
5. **Pagination** → Handle large datasets
6. **Error handling** → Display proper error messages

### Frontend Routes Should Map To:
- `/login` → `POST /api/auth/login`
- `/dashboard` → `GET /api/manager/dashboard/*`
- `/orders/new` → `POST /api/customer/orders`
- `/orders/:id` → `GET /api/manager/orders/:id`
- `/track/:trackingId` → WebSocket + `GET /api/tracking/order/{orderId}`
- `/inventory` → `GET /api/manager/inventory/warehouse/{id}`
- `/vehicles` → `GET /api/manager/vehicles`
- `/products` → `GET /api/catalog/products`
- `/customers` → `GET /api/customers`
- `/warehouses` → `GET /api/warehouses/manager`

---

## 🔗 Quick Reference Links

- **Java API Docs Path:** Check `/api/manager/orders` endpoints for pagination parameters
- **SignalR Hub Name:** `OrderTrackingHub`
- **Service JWT Shared Secret:** `logigraph_super_secret_shared_key_32_chars_min`
- **MySQL Credentials:** `root` / `root`
- **Test Endpoints:** `/test/hello`, `/test/echo`


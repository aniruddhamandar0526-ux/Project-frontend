# LogiGraph Backend - Data Models & Schemas

## 📋 Complete Data Models

### User Model (Authentication)
```json
{
  "userId": 1,
  "username": "john_doe",
  "password": "hashed_password",
  "createdAt": "2026-02-01T00:00:00Z",
  "role": "CUSTOMER"  // or ADMIN, MANAGER
}
```

---

### Customer Model
```json
{
  "id": 10,
  "userId": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "address": "123 Main St, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "createdAt": "2026-02-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z"
}
```

#### CreateCustomerRequest
```json
{
  "userId": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "address": "123 Main St, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

#### UpdateCustomerRequest
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91-9876543210",
  "address": "456 Side St, Mumbai"
}
```

#### CustomerResponse
```json
{
  "id": 10,
  "userId": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "address": "123 Main St, Mumbai",
  "createdAt": "2026-02-01T00:00:00Z"
}
```

---

### Product Model
```json
{
  "id": 101,
  "name": "Laptop Pro",
  "sku": "LAPTOP-001",
  "description": "High-performance laptop with 16GB RAM",
  "price": 50000.00,
  "category": "Electronics",
  "createdAt": "2026-02-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z"
}
```

#### CreateProductRequest
```json
{
  "name": "Laptop Pro",
  "sku": "LAPTOP-001",
  "description": "High-performance laptop with 16GB RAM",
  "price": 50000.00,
  "category": "Electronics"
}
```

#### UpdateProductRequest
```json
{
  "name": "Laptop Pro Max",
  "description": "Updated description",
  "price": 55000.00,
  "category": "Electronics"
}
```

#### ProductResponse
```json
{
  "id": 101,
  "name": "Laptop Pro",
  "sku": "LAPTOP-001",
  "description": "High-performance laptop with 16GB RAM",
  "price": 50000.00,
  "category": "Electronics"
}
```

---

### Warehouse Model
```json
{
  "id": 1,
  "warehouseName": "Mumbai Central",
  "location": "Navi Mumbai",
  "latitude": 19.0176,
  "longitude": 73.0055,
  "capacity": 10000,
  "currentOccupancy": 5000,
  "createdAt": "2026-02-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z"
}
```

#### CreateWarehouseRequest
```json
{
  "warehouseName": "Mumbai Central",
  "location": "Navi Mumbai",
  "latitude": 19.0176,
  "longitude": 73.0055,
  "capacity": 10000
}
```

#### UpdateWarehouseRequest
```json
{
  "warehouseName": "Mumbai Central Hub",
  "location": "Navi Mumbai",
  "capacity": 15000
}
```

#### WarehouseResponse
```json
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

### Vehicle Model
```json
{
  "id": 201,
  "registrationNumber": "DL-01-AB-1234",
  "vehicleType": "TRUCK",  // or VAN, BIKE, CAR
  "capacity": 5000,
  "currentStatus": "ACTIVE",  // ACTIVE, INACTIVE, MAINTENANCE, ON_DELIVERY
  "assignedWarehouseId": 1,
  "assignedWarehouseName": "Mumbai Central",
  "lastLocationLat": 19.0176,
  "lastLocationLng": 73.0055,
  "createdAt": "2026-02-01T00:00:00Z",
  "updatedAt": "2026-02-01T00:00:00Z"
}
```

#### CreateVehicleRequest
```json
{
  "registrationNumber": "DL-01-AB-1234",
  "vehicleType": "TRUCK",
  "capacity": 5000,
  "warehouseId": 1
}
```

#### UpdateVehicleStatusRequest
```json
{
  "status": "MAINTENANCE"  // ACTIVE, INACTIVE, MAINTENANCE
}
```

#### UpdateVehicleWarehouseRequest
```json
{
  "warehouseId": 2
}
```

#### VehicleResponse
```json
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

### Inventory Model
```json
{
  "id": 1001,
  "warehouseId": 1,
  "warehouseName": "Mumbai Central",
  "productId": 101,
  "productName": "Laptop Pro",
  "productSku": "LAPTOP-001",
  "quantity": 500,
  "reorderLevel": 100,
  "lastRestockedAt": "2026-02-01T00:00:00Z"
}
```

#### AddInventoryRequest
```json
{
  "warehouseId": 1,
  "productId": 101,
  "quantity": 500
}
```

#### AdjustInventoryRequest
```json
{
  "warehouseId": 1,
  "productId": 101,
  "delta": 50  // positive (add) or negative (reduce)
}
```

#### WarehouseInventoryView
```json
{
  "warehouseId": 1,
  "warehouseName": "Mumbai Central",
  "inventory": [
    {
      "productId": 101,
      "productName": "Laptop Pro",
      "productSku": "LAPTOP-001",
      "quantity": 500,
      "reorderLevel": 100,
      "lastRestockedAt": "2026-02-01T00:00:00Z"
    },
    {
      "productId": 102,
      "productName": "Mobile Phone",
      "productSku": "PHONE-001",
      "quantity": 1000,
      "reorderLevel": 200,
      "lastRestockedAt": "2026-02-02T00:00:00Z"
    }
  ]
}
```

---

### Order Model (Core)
```json
{
  "id": 5001,
  "customerId": 10,
  "customerName": "John Doe",
  "status": "IN_TRANSIT",
  "totalPrice": 150000.00,
  "assignedVehicleId": 201,
  "assignedWarehouseId": 1,
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "deliveryAddress": "123 Main St, Mumbai",
  "deliveryDate": "2026-02-15",
  "estimatedDeliveryDays": 2,
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:35:00Z"
}
```

#### CreateOrderRequest
```json
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
  "deliveryAddress": "123 Main St, Mumbai",
  "deliveryDate": "2026-02-15",
  "estimatedDeliveryDays": 2
}
```

#### OrderResponse (for order placement)
```json
{
  "id": 5001,
  "customerId": 10,
  "status": "ASSIGNED",
  "totalPrice": 150000.00,
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:30:05Z",
  "trackingId": "TRK-A1B2C3D4E5F6G7H8"
}
```

#### OrderDetailResponse (for detailed retrieval)
```json
{
  "id": 5001,
  "customerId": 10,
  "customerName": "John Doe",
  "status": "IN_TRANSIT",
  "totalPrice": 150000.00,
  "items": [
    {
      "productId": 101,
      "productName": "Laptop Pro",
      "quantity": 2,
      "unitPrice": 50000.00,
      "totalPrice": 100000.00
    },
    {
      "productId": 102,
      "productName": "Mobile Phone",
      "quantity": 1,
      "unitPrice": 50000.00,
      "totalPrice": 50000.00
    }
  ],
  "assignedVehicleId": 201,
  "assignedWarehouseName": "Mumbai Central",
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "deliveryAddress": "123 Main St, Mumbai",
  "deliveryDate": "2026-02-15",
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

#### OrderItemDetail
```json
{
  "productId": 101,
  "productName": "Laptop Pro",
  "quantity": 2,
  "unitPrice": 50000.00,
  "totalPrice": 100000.00
}
```

#### OrderStatusHistoryView
```json
{
  "orderId": 5001,
  "statuses": [
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

#### UpdateOrderStatusRequest
```json
{
  "status": "DELIVERED"
}
```

#### CancelOrderRequest
```json
{
  "reason": "Customer requested cancellation"
}
```

---

### Order Status Enums
```
PENDING          → Order received, awaiting warehouse processing
ASSIGNED         → Vehicle assigned, preparing for shipment
IN_TRANSIT       → Order picked up, on the way
DELIVERED        → Delivered to customer location
COMPLETED        → Order fulfilled and customer confirmed
CANCELLED        → Order cancelled by customer or admin
```

---

### Dashboard Models

#### OrderSummaryView
```json
{
  "orderId": 5001,
  "customerId": 10,
  "customerName": "John Doe",
  "status": "IN_TRANSIT",
  "totalPrice": 150000.00,
  "createdAt": "2026-02-08T10:30:00Z",
  "deliveryAddress": "123 Main St, Mumbai"
}
```

#### FleetStatusView
```json
{
  "vehicleId": 201,
  "registrationNumber": "DL-01-AB-1234",
  "vehicleType": "TRUCK",
  "status": "ON_DELIVERY",
  "capacity": 5000,
  "currentOrderId": 5001,
  "currentLat": 19.0450,
  "currentLng": 72.9000
}
```

#### LowStockView
```json
{
  "productId": 101,
  "productName": "Laptop Pro",
  "productSku": "LAPTOP-001",
  "warehouseId": 1,
  "warehouseName": "Mumbai Central",
  "currentQuantity": 50,
  "reorderLevel": 100,
  "shortage": 50
}
```

---

### Real-Time Tracking Models (.NET)

#### TrackingSession (In-Memory)
```json
{
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "orderId": 5001,
  "vehicleId": 201,
  "currentLat": 19.0450,
  "currentLng": 72.9000,
  "status": "IN_TRANSIT"
}
```

#### StartTrackingRequest (Java sends to .NET)
```json
{
  "orderId": 5001,
  "vehicleId": 201,
  "startLat": 19.0176,
  "startLng": 73.0055,
  "destLat": 19.0760,
  "destLng": 72.8777,
  "averageSpeedKmph": 40
}
```

#### StartTrackingResponse
```json
{
  "trackingId": "TRK-A1B2C3D4E5F6G7H8",
  "status": "STARTED"
}
```

#### TrackingQueryResponse
```json
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

### SignalR WebSocket Messages

#### Client Join Group
```javascript
connection.invoke("JoinOrder", 5001);
```

#### Location Update Event (from .NET to Client)
```json
{
  "lat": 19.0450,
  "lng": 72.9000,
  "status": "IN_TRANSIT",
  "timestamp": "2026-02-08T10:35:00Z"
}
```

#### Delivery Completed Event (from .NET to Client)
```json
{
  "orderId": 5001,
  "vehicleId": 201,
  "deliveredAt": "2026-02-08T10:45:00Z",
  "message": "Order delivered successfully"
}
```

---

### Integration Models

#### DeliveryCompletedRequest (.NET sends to Java)
```json
{
  "orderId": 5001,
  "vehicleId": 201
}
```

---

### Error Response Models

#### ValidationErrorResponse
```json
{
  "timestamp": "2026-02-08T10:30:00Z",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input",
  "details": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than 0"
    }
  ]
}
```

#### NotFoundErrorResponse
```json
{
  "timestamp": "2026-02-08T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Order with id 9999 not found",
  "path": "/api/manager/orders/9999"
}
```

#### UnauthorizedErrorResponse
```json
{
  "timestamp": "2026-02-08T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required",
  "path": "/api/customer/orders"
}
```

#### ForbiddenErrorResponse
```json
{
  "timestamp": "2026-02-08T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "path": "/api/manager/vehicles"
}
```

---

### Pagination Response Model
```json
{
  "content": [
    {
      "id": 5001,
      "customerId": 10,
      "status": "IN_TRANSIT"
      // ... order fields
    },
    {
      "id": 5002,
      "customerId": 11,
      "status": "PENDING"
      // ... order fields
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "hasNext": true,
  "hasPrevious": false
}
```

---

## 📊 Field Validation Rules

### User
- `username`: 3-50 chars, alphanumeric + underscore
- `password`: min 6 chars

### Customer
- `fullName`: required, 2-100 chars
- `email`: valid email format
- `phone`: valid phone format (optional)
- `pincode`: 6 digits (India)

### Product
- `name`: required, 2-255 chars
- `sku`: required, unique, 3-50 chars
- `price`: required, > 0
- `description`: optional, max 1000 chars

### Warehouse
- `warehouseName`: required, 2-100 chars
- `capacity`: required, > 0
- `latitude`: required, valid coordinates
- `longitude`: required, valid coordinates

### Vehicle
- `registrationNumber`: required, unique
- `vehicleType`: required, one of [TRUCK, VAN, BIKE, CAR]
- `capacity`: required, > 0
- `warehouseId`: required, must exist

### Order
- `items`: required, min 1 item
- `quantity`: each item > 0
- `deliveryAddress`: required, 5-500 chars
- `deliveryDate`: future date
- `estimatedDeliveryDays`: > 0

---

## 🔢 Common Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful operation with no response body |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate unique field (SKU, registration #) |
| 500 | Internal Server Error | Server exception |


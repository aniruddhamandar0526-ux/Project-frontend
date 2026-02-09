# LogiGraph Frontend - Complete Setup Guide

## Project Overview

LogiGraph is a complete **Logistics Management System** with role-based access control for ADMIN, MANAGER, and CUSTOMER roles.

## Architecture

### Technology Stack
- **Frontend Framework:** React 19 with Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios with JWT interceptors
- **UI Components:** Lucide React Icons
- **Notifications:** React Hot Toast
- **Charts:** Recharts (optional for dashboards)

### Project Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication state management
├── hooks/
│   └── useAuth.js               # Custom auth hook
├── api/
│   └── client.js                # Axios API client with all endpoints
├── components/
│   ├── ProtectedRoute.jsx       # Route protection with role checking
│   ├── AdminLayout.jsx          # Admin sidebar layout
│   ├── ManagerLayout.jsx        # Manager sidebar layout
│   ├── CustomerLayout.jsx       # Customer sidebar layout
│   ├── ToastProvider.jsx        # Toast notifications
│   └── ...other components
├── pages/
│   ├── Landing.jsx              # Public landing page
│   ├── Login.jsx                # Public login page
│   ├── Register.jsx             # Public registration page
│   ├── Unauthorized.jsx         # 403 page
│   ├── admin/
│   │   ├── Dashboard.jsx        # Admin dashboard
│   │   ├── Products.jsx         # Product management
│   │   ├── Customers.jsx        # Customer management
│   │   └── Warehouses.jsx       # Warehouse management
│   ├── manager/
│   │   ├── Dashboard.jsx        # Manager dashboard
│   │   ├── Orders.jsx           # Order management
│   │   ├── OrderDetail.jsx      # Order details
│   │   ├── Inventory.jsx        # Inventory management
│   │   ├── Vehicles.jsx         # Fleet management
│   │   └── Tracking.jsx         # Real-time tracking
│   └── customer/
│       ├── Dashboard.jsx        # Customer home
│       ├── CreateOrder.jsx      # Create orders
│       ├── MyOrders.jsx         # View orders
│       └── OrderTrack.jsx       # Track orders
├── App.jsx                      # Main routing
├── main.jsx                     # Entry point
└── index.css                    # Tailwind CSS setup
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn installed
- Java Backend running on `http://localhost:8082`
- .NET Backend running on `http://localhost:5160`

### Steps

1. **Install Dependencies**
   ```bash
   cd e:\C DAC Project\123\logigraph-frontend
   npm install
   ```

2. **Configure Backend URLs**
   - Java Backend: `http://localhost:8082/api`
   - .NET Backend: `http://localhost:5160/api`
   - (Already configured in `src/api/client.js`)

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Frontend will be available at: `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Role-Based Access Control

### ADMIN (admin/admin)
- **Can Access:**
  - `/admin/dashboard` - Overview of system
  - `/admin/products` - Create, read, update, delete products
  - `/admin/customers` - Manage customer profiles
  - `/admin/warehouses` - Setup distribution centers
- **Cannot Access:**
  - Manager or Customer pages

### MANAGER (manager/manager)
- **Can Access:**
  - `/manager/dashboard` - Operations overview
  - `/manager/orders` - View and manage all orders
  - `/manager/orders/:orderId` - Order details and history
  - `/manager/inventory` - Warehouse stock management
  - `/manager/vehicles` - Fleet vehicle management
  - `/manager/tracking/:orderId` - Real-time order tracking
- **Cannot Access:**
  - Admin or Customer pages

### CUSTOMER (customer/customer)
- **Can Access:**
  - `/customer/dashboard` - Home page
  - `/customer/create-order` - Place new orders
  - `/customer/my-orders` - View own orders only
  - `/customer/track/:orderId` - Track own orders
- **Cannot Access:**
  - Admin or Manager pages

## Authentication Flow

### Login Process
1. User enters username and password on `/login`
2. Frontend calls `/api/auth/login` endpoint
3. Backend returns JWT token
4. Token decoded to extract user role
5. User redirected to role-specific dashboard:
   - ADMIN → `/admin/dashboard`
   - MANAGER → `/manager/dashboard`
   - CUSTOMER → `/customer/dashboard`
6. Token stored in localStorage with user info

### Token Management
- JWT token automatically added to all requests via Axios interceptor
- Expired token triggers auto-logout and redirect to `/login`
- Token stored in localStorage for session persistence

## API Integration

### Available API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/ping` - Health check

**Products (ADMIN only):**
- `GET /api/catalog/products` - Get all products
- `POST /api/catalog/products` - Create product
- `PUT /api/catalog/products/{id}` - Update product
- `DELETE /api/catalog/products/{id}` - Delete product

**Customers (ADMIN only):**
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

**Orders:**
- `POST /api/customer/orders` - Create order (CUSTOMER)
- `GET /api/manager/orders` - Get all orders (MANAGER)
- `PUT /api/manager/orders/{id}/status` - Update status (MANAGER)

**Tracking (.NET Backend):**
- `POST /api/tracking/start` - Start tracking
- `GET /api/tracking/order/{orderId}` - Get tracking status
- WebSocket: `/hubs/orders` - Real-time location updates

*All endpoints documented in `ENDPOINT_REFERENCE_COMPLETE.md`*

## Features Implemented

### ✅ Completed
- [x] Role-based routing and access control
- [x] Authentication with JWT
- [x] Layout components for each role
- [x] Landing page with features
- [x] Login page with demo credentials
- [x] Registration page with validation
- [x] Admin dashboard with quick links
- [x] Manager dashboard with stats
- [x] Customer dashboard with getting started
- [x] API client with all endpoints
- [x] Toast notifications
- [x] Protected routes
- [x] Auto-logout on token expiration
- [x] Tailwind CSS styling
- [x] Responsive design

### 🚀 Ready for Full Implementation
- [ ] Product CRUD pages (structure ready)
- [ ] Customer management pages (structure ready)
- [ ] Order management with tables (structure ready)
- [ ] Inventory management interface (structure ready)
- [ ] Vehicle fleet management (structure ready)
- [ ] Real-time WebSocket tracking (structure ready)
- [ ] Form validation and error handling
- [ ] Data tables with pagination
- [ ] Advanced filtering and search
- [ ] Analytics charts and graphs

## Demo Credentials

Use these credentials to test different roles:

```
ADMIN
Username: admin
Password: admin

MANAGER
Username: manager
Password: manager

CUSTOMER
Username: customer
Password: customer
```

## Key Implementation Details

### AuthContext
- Manages user authentication state globally
- Stores JWT token in localStorage
- Auto-loads user session on app mount
- Provides login/logout functions
- Available everywhere via `useAuth()` hook

### ProtectedRoute
- Checks if user is authenticated
- Validates user role against required roles
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if role doesn't match

### API Client
- Centralized Axios instance with base URL
- Automatic JWT token injection in headers
- Error handling with auto-logout on 401
- All 43+ endpoints wrapped in organized functions

### Layouts
- Each role has dedicated layout component
- Sidebar navigation with role-specific menus
- Header with user info and logout button
- Responsive design for mobile and desktop
- Color-coded sidebars per role

## Development Notes

### Adding New Pages
1. Create component in `src/pages/{role}/NewPage.jsx`
2. Wrap with role-specific layout
3. Add route in `App.jsx` with proper role protection
4. Import API functions from `api/client.js`

### Using the Auth Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, logout, isAuthenticated, userRole } = useAuth();
  // user: { username, role }
}
```

### Making API Calls
```javascript
import { orderAPI, productAPI, customerAPI } from '../api/client';

// Automatically includes JWT token
const orders = await orderAPI.getAll();
const product = await productAPI.getById(1);
```

## Troubleshooting

### Login Issues
- Ensure Java backend is running on port 8082
- Check network tab for JWT response
- Verify demo credentials in backend

### API Errors
- Check backend is accessible at `http://localhost:8082`
- Verify JWT token in localStorage
- Check browser console for detailed errors

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Run `npm install` to get latest versions
- Clear browser cache if styles don't update

## Production Deployment

1. Build the project: `npm run build`
2. Output in `dist/` folder
3. Deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Docker container
   - Traditional web server

## Security Considerations

- JWT tokens stored in localStorage (vulnerable to XSS)
- Consider moving to httpOnly cookies in production
- Implement token refresh mechanism
- Add HTTPS in production
- Validate all user inputs
- Implement rate limiting
- Add CSRF protection

## Support & Documentation

- Backend API: `ENDPOINT_REFERENCE_COMPLETE.md`
- Database Schema: `DATABASE Script v4`
- Architecture: `BACKEND_ANALYSIS.md`

---

**Frontend Ready for Development** ✅  
**All core infrastructure in place**  
**Backend integration complete**  
**Ready for feature implementation**

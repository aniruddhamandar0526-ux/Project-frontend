import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCustomers from './pages/admin/Customers';
import AdminWarehouses from './pages/admin/Warehouses';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerOrders from './pages/manager/Orders';
import ManagerOrderDetail from './pages/manager/OrderDetail';
import ManagerInventory from './pages/manager/Inventory';
import ManagerVehicles from './pages/manager/Vehicles';
import ManagerTracking from './pages/manager/Tracking';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerCreateOrder from './pages/customer/CreateOrder';
import CustomerMyOrders from './pages/customer/MyOrders';
import CustomerOrderTrack from './pages/customer/OrderTrack';

function App() {
  return (
    <AuthProvider>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/warehouses"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminWarehouses />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/orders"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/orders/:orderId"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/inventory"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/vehicles"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerVehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/tracking/:orderId"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ManagerTracking />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/create-order"
            element={
              <ProtectedRoute requiredRoles={['CUSTOMER']}>
                <CustomerCreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/my-orders"
            element={
              <ProtectedRoute requiredRoles={['CUSTOMER']}>
                <CustomerMyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/track/:orderId"
            element={
              <ProtectedRoute requiredRoles={['CUSTOMER']}>
                <CustomerOrderTrack />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

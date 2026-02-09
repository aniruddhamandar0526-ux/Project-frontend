import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { label: 'Dashboard', path: `/${user.role.toLowerCase()}/dashboard` },
    ];

    if (user.role === 'ADMIN') {
      return [
        ...baseItems,
        { label: 'Products', path: '/admin/products' },
        { label: 'Customers', path: '/admin/customers' },
        { label: 'Warehouses', path: '/admin/warehouses' },
      ];
    }

    if (user.role === 'MANAGER') {
      return [
        ...baseItems,
        { label: 'Orders', path: '/manager/orders' },
        { label: 'Inventory', path: '/manager/inventory' },
        { label: 'Vehicles', path: '/manager/vehicles' },
        { label: 'Tracking', path: '/manager/tracking' },
      ];
    }

    if (user.role === 'CUSTOMER') {
      return [
        ...baseItems,
        { label: 'Create Order', path: '/customer/create-order' },
        { label: 'My Orders', path: '/customer/my-orders' },
        { label: 'Track Order', path: '/customer/track-order' },
      ];
    }

    return baseItems;
  };

  const menuItems = getRoleMenuItems();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
            >
              LogiGraph
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{user?.username}</span>
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-md text-indigo-600 font-medium hover:bg-indigo-50"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {isAuthenticated && menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-indigo-600"
              >
                {item.label}
              </button>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 mt-2 border-t border-gray-200"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

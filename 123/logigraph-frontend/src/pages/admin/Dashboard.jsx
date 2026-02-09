import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { productAPI, customerAPI, warehouseAPI } from '../../api/client';
import { Package, Users, Warehouse } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalWarehouses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Try to fetch from APIs with fallbacks
      try {
        const productsRes = await productAPI.getAll();
        setStats(prev => ({
          ...prev,
          totalProducts: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        }));
      } catch {
        console.log('Products API unavailable');
      }

      try {
        const customersRes = await customerAPI.getAll();
        setStats(prev => ({
          ...prev,
          totalCustomers: Array.isArray(customersRes.data) ? customersRes.data.length : 0,
        }));
      } catch {
        console.log('Customers API unavailable');
      }

      try {
        const warehousesRes = await warehouseAPI.getAll();
        setStats(prev => ({
          ...prev,
          totalWarehouses: Array.isArray(warehousesRes.data) ? warehousesRes.data.length : 0,
        }));
      } catch {
        console.log('Warehouses API unavailable');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <Package className="w-10 h-10 text-indigo-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Total Products</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
              <a href="/admin/products" className="text-indigo-600 text-sm hover:underline mt-4 block font-medium">
                Manage Products →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <Users className="w-10 h-10 text-blue-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Total Customers</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
              <a href="/admin/customers" className="text-blue-600 text-sm hover:underline mt-4 block font-medium">
                Manage Customers →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <Warehouse className="w-10 h-10 text-green-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Total Warehouses</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalWarehouses}</p>
                </div>
              </div>
              <a href="/admin/warehouses" className="text-green-600 text-sm hover:underline mt-4 block font-medium">
                Manage Warehouses →
              </a>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Control Panel</h2>
            <p className="text-gray-600 mb-8">
              Use the menu on the left to manage your logistics network including products, customers, and warehouses.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="/admin/products" className="block p-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                <p className="font-semibold text-lg">📦 Products</p>
                <p className="text-sm text-gray-600 mt-2">Add, edit, and delete products</p>
              </a>
              <a href="/admin/customers" className="block p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                <p className="font-semibold text-lg">👥 Customers</p>
                <p className="text-sm text-gray-600 mt-2">Manage customer profiles</p>
              </a>
              <a href="/admin/warehouses" className="block p-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition">
                <p className="font-semibold text-lg">🏭 Warehouses</p>
                <p className="text-sm text-gray-600 mt-2">Setup distribution centers</p>
              </a>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

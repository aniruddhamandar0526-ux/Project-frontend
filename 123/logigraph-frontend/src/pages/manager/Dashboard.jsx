import { useState, useEffect } from 'react';
import ManagerLayout from '../../components/ManagerLayout';
import { dashboardAPI } from '../../api/client';
import { Package, Truck, TrendingUp } from 'lucide-react';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    orders: {},
    fleetStatus: {},
    lowStock: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [ordersRes, fleetRes, stockRes] = await Promise.all([
        dashboardAPI.getOrdersByStatus().catch(() => ({ data: {} })),
        dashboardAPI.getFleetStatus().catch(() => ({ data: {} })),
        dashboardAPI.getLowStockAlerts().catch(() => ({ data: [] })),
      ]);

      setStats({
        orders: ordersRes.data || {},
        fleetStatus: fleetRes.data || {},
        lowStock: Array.isArray(stockRes.data) ? stockRes.data : [],
      });
    } catch {
      console.log('Dashboard data load failed');
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = Object.values(stats.orders).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

  return (
    <ManagerLayout title="Dashboard">
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
                  <h3 className="text-gray-600 text-sm font-semibold">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
              <a href="/manager/orders" className="text-indigo-600 text-sm hover:underline mt-4 block font-medium">
                Manage Orders →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <Truck className="w-10 h-10 text-blue-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Fleet Status</h3>
                  <p className="text-3xl font-bold text-gray-900">-</p>
                </div>
              </div>
              <a href="/manager/vehicles" className="text-blue-600 text-sm hover:underline mt-4 block font-medium">
                View Vehicles →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Low Stock Items</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.lowStock.length}</p>
                </div>
              </div>
              <a href="/manager/inventory" className="text-green-600 text-sm hover:underline mt-4 block font-medium">
                View Inventory →
              </a>
            </div>
          </div>

          {/* Orders by Status */}
          {Object.keys(stats.orders).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
              <div className="grid md:grid-cols-6 gap-4">
                {Object.entries(stats.orders).map(([status, count]) => (
                  <div key={status} className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 font-medium">{status}</p>
                    <p className="text-2xl font-bold text-indigo-600">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <a href="/manager/orders" className="block p-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-center">
                <p className="font-semibold">View Orders</p>
              </a>
              <a href="/manager/inventory" className="block p-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-center">
                <p className="font-semibold">Inventory</p>
              </a>
              <a href="/manager/vehicles" className="block p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-center">
                <p className="font-semibold">Vehicles</p>
              </a>
              <a href="/manager/tracking/1" className="block p-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition text-center">
                <p className="font-semibold">Tracking</p>
              </a>
            </div>
          </div>
        </>
      )}
    </ManagerLayout>
  );
}

import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  fetchRecentOrders,
  fetchOrdersByStatus,
  fetchFleetStatus,
  fetchLowStockAlerts,
} from "../api/dashboardApi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [fleet, setFleet] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          recentOrders,
          statusMap,
          fleetStatus,
          lowStockItems,
        ] = await Promise.all([
          fetchRecentOrders(),
          fetchOrdersByStatus(),
          fetchFleetStatus(),
          fetchLowStockAlerts(),
        ]);

        setOrders(recentOrders);
        setOrderStats(statusMap);
        setFleet(fleetStatus);
        setLowStock(lowStockItems);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalOrders = Object.values(orderStats).reduce(
    (sum, count) => sum + count,
    0
  );

  const activeVehicles = fleet.filter(
    (v) => v.status === "IN_TRANSIT"
  ).length;

  // Prepare chart data
  const statusChartData = Object.entries(orderStats).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const fleetChartData = Object.entries(
    fleet.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Generate trend data (mock for demonstration)
  const trendData = [
    { day: "Mon", orders: 12, delivered: 8 },
    { day: "Tue", orders: 19, delivered: 15 },
    { day: "Wed", orders: 15, delivered: 12 },
    { day: "Thu", orders: 22, delivered: 18 },
    { day: "Fri", orders: 28, delivered: 25 },
    { day: "Sat", orders: 18, delivered: 16 },
    { day: "Sun", orders: 14, delivered: 12 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
        <Metric
          title="Total Orders"
          value={totalOrders}
          subtitle="All statuses"
          color="blue"
        />
        <Metric
          title="In Progress"
          value={orderStats.IN_PROGRESS || 0}
          subtitle="Currently active"
          color="yellow"
        />
        <Metric
          title="Delivered"
          value={orderStats.DELIVERED || 0}
          subtitle="Completed"
          color="green"
        />
        <Metric
          title="Cancelled"
          value={orderStats.CANCELLED || 0}
          subtitle="Cancelled"
          color="red"
        />
        <Metric
          title="Active Vehicles"
          value={activeVehicles}
          subtitle="On route"
          color="purple"
        />
        <Metric
          title="Low Stock Alerts"
          value={lowStock.length}
          subtitle="Needs attention"
          color="orange"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Fleet Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fleetChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ORDER TREND */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Order Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="delivered"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "IN_TRANSIT"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      ${order.totalPrice?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Metric({ title, value, subtitle, color }) {
  const colorClasses = {
    blue: "text-blue-600 border-blue-100 bg-blue-50",
    green: "text-green-600 border-green-100 bg-green-50",
    red: "text-red-600 border-red-100 bg-red-50",
    yellow: "text-yellow-600 border-yellow-100 bg-yellow-50",
    purple: "text-purple-600 border-purple-100 bg-purple-50",
    orange: "text-orange-600 border-orange-100 bg-orange-50",
  };

  return (
    <div
      className={`rounded-xl shadow border p-6 ${
        colorClasses[color] || colorClasses.blue
      }`}
    >
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs opacity-60 mt-1">{subtitle}</p>
    </div>
  );
}

export default Dashboard;

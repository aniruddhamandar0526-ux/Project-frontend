import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { fetchMyOrders } from "../api/orderApi";

function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadOrders() {
    try {
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Customer orders not available yet");
      setOrders([]); // 🔥 prevent crash
    } finally {
      setLoading(false);
    }
  }

  loadOrders();
}, []);

  const total = orders.length;
  const inProgress = orders.filter(
    (o) => o.status === "IN_PROGRESS"
  ).length;
  const delivered = orders.filter(
    (o) => o.status === "DELIVERED"
  ).length;

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        My Dashboard
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Metric title="My Orders" value={total} />
        <Metric title="In Transit" value={inProgress} />
        <Metric title="Delivered" value={delivered} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Recent Orders
        </h2>

        {loading && <p>Loading...</p>}

        {!loading && orders.length === 0 && (
          <p className="text-gray-500">
            You have not placed any orders yet.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.orderId}>
                  <td className="p-2 border">
                    {order.orderId}
                  </td>
                  <td className="p-2 border">
                    {order.status}
                  </td>
                  <td className="p-2 border">
                    {order.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-2">
        {value}
      </p>
    </div>
  );
}

export default CustomerDashboard;

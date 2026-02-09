import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { fetchAllOrders } from "../api/orderApi";
import { isMockAuthEnabled, mockUser } from "../utils/mockAuth";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); 

  const isAdminOrManager =
    isMockAuthEnabled
      ? ["ADMIN", "MANAGER"].includes(mockUser.role)
      : true; // JWT decides in real mode

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchAllOrders();
        setOrders(data.content || []);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAdminOrManager) {
      loadOrders();
    }
  }, [isAdminOrManager]);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Orders Management
      </h1>

      {!isAdminOrManager && (
        <p className="text-red-500">
          You are not authorized to view this page.
        </p>
      )}

      {loading && <p>Loading orders...</p>}

      {!loading && isAdminOrManager && (
        <div className="bg-white rounded-xl shadow p-6">
          {orders.length === 0 ? (
            <p className="text-gray-500">
              No orders found.
            </p>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Tracking ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Customer</th>
                  <th className="p-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/orders/${order.orderId}`)
                    }
                  >
                    <td className="p-2 border">
                      {order.orderId}
                    </td>
                    <td className="p-2 border">
                      {order.trackingId}
                    </td>
                    <td className="p-2 border">
                      {order.status}
                    </td>
                    <td className="p-2 border">
                      {order.customerId}
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
      )}
    </AppLayout>
  );
}

export default Orders;

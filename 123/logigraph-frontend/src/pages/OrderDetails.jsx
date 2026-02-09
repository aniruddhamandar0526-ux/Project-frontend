import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import {
  fetchOrderDetails,
  fetchOrderItems,
  fetchOrderHistory,
  updateOrderStatus,
  cancelOrder,
} from "../api/orderApi";

const STATUS_OPTIONS = [
  "CREATED",
  "IN_PROGRESS",
  "IN_TRANSIT",
  "DELIVERED",
];

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    const [o, i, h] = await Promise.all([
      fetchOrderDetails(orderId),
      fetchOrderItems(orderId),
      fetchOrderHistory(orderId),
    ]);

    setOrder(o);
    setItems(i);
    setHistory(h);
    setStatus(o.status);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadOrder();
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [orderId]);

  async function handleStatusUpdate() {
    try {
      await updateOrderStatus(orderId, {
        status,
        notes,
      });
      setNotes("");
      await loadOrder();
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Status update failed");
    }
  }

  async function handleCancelOrder() {
    const reason = prompt(
      "Enter cancellation reason:"
    );
    if (!reason) return;

    try {
      await cancelOrder(orderId, { reason });
      await loadOrder();
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Order cancellation failed");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p>Loading order...</p>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <p className="text-red-500">
          Order not found
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Order #{order.orderId}
      </h1>

      {/* ORDER SUMMARY */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">
          Order Summary
        </h2>

        <p>Status: {order.status}</p>
        <p>Tracking ID: {order.trackingId}</p>
        <p>Customer ID: {order.customerId}</p>
      </div>

      {/* ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">
          Update Order Status
        </h2>

        <div className="flex gap-3 mb-3">
          <select
            className="border p-2 rounded"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            className="border p-2 rounded flex-1"
            placeholder="Notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
          />

          <button
            onClick={handleStatusUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </div>

        <button
          onClick={handleCancelOrder}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Cancel Order
        </button>
      </div>

      {/* ORDER ITEMS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">
          Order Items
        </h2>

        <ul>
          {items.map((item, idx) => (
            <li key={idx}>
              Product #{item.productId} — Qty{" "}
              {item.quantity}
            </li>
          ))}
        </ul>
      </div>

      {/* STATUS TIMELINE */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">
          Status Timeline
        </h2>

        <ul className="space-y-2">
          {history.map((h, idx) => (
            <li
              key={idx}
              className="border-l-4 border-blue-600 pl-4"
            >
              <strong>{h.status}</strong>
              <div className="text-sm text-gray-500">
                {h.changedAt} by {h.changedBy}
              </div>
              {h.notes && (
                <div className="text-sm">
                  {h.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}

export default OrderDetails;
    
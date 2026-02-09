import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { fetchOrderDetails, fetchOrderHistory } from "../api/orderApi";
import { Loader2 } from "lucide-react";

const statusSequence = [
  "CREATED",
  "IN_PROGRESS",
  "IN_TRANSIT",
  "DELIVERED"
];

function OrderTimeline() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orderData, historyData] = await Promise.all([
          fetchOrderDetails(orderId),
          fetchOrderHistory(orderId)
        ]);
        setOrder(orderData);
        setHistory(historyData || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load order timeline", err);
        setError("Failed to load order timeline data");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadData();
    }
  }, [orderId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || "Order not found"}</p>
        </div>
      </AppLayout>
    );
  }

  // Determine which steps are active based on current status
  const currentStatusIndex = statusSequence.indexOf(order.status);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Order Lifecycle
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time order progression through the logistics pipeline
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Order #{order.orderId}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-semibold text-slate-800">{order.status}</p>
              </div>
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-semibold text-slate-800">${order.totalPrice}</p>
              </div>
              <div>
                <p className="text-slate-500">Created</p>
                <p className="font-semibold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Items</p>
                <p className="font-semibold text-slate-800">{order.itemCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {statusSequence.map((status, index) => (
              <TimelineStep
                key={status}
                title={formatStatus(status)}
                description={getStatusDescription(status)}
                active={index <= currentStatusIndex}
                completed={index < currentStatusIndex}
                timestamp={getTimestampForStatus(status, history)}
              />
            ))}
          </div>
        </div>

        {/* History Timeline */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Status History
            </h3>
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-slate-700">{entry.status}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="font-semibold text-emerald-700 mb-2">
            System Workflow
          </h3>
          <p className="text-sm text-emerald-700 leading-relaxed">
            Each order progresses through multiple states managed by the backend.
            State transitions are recorded and broadcast in real time to ensure
            accurate tracking and operational transparency.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function formatStatus(status) {
  return status
    .split("_")
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function getStatusDescription(status) {
  const descriptions = {
    "CREATED": "Order placed by customer",
    "IN_PROGRESS": "Warehouse processing order",
    "IN_TRANSIT": "Vehicle en route to destination",
    "DELIVERED": "Order delivered successfully"
  };
  return descriptions[status] || "In progress";
}

function getTimestampForStatus(status, history) {
  const entry = history.find(h => h.status === status);
  return entry ? new Date(entry.timestamp).toLocaleDateString() : null;
}

function TimelineStep({ title, description, active, completed, timestamp }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mb-3 transition ${
          completed
            ? "bg-green-600"
            : active
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >
        {completed ? "✓" : active ? "→" : "○"}
      </div>

      <h4 className="font-semibold text-slate-700">
        {title}
      </h4>

      <p className="text-sm text-slate-500 mt-1">
        {description}
      </p>

      {timestamp && (
        <p className="text-xs text-slate-400 mt-2">
          {timestamp}
        </p>
      )}
    </div>
  );
}

export default OrderTimeline;



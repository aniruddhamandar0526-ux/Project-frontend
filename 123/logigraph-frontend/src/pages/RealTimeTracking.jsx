import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { fetchOrderDetails } from "../api/orderApi";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

function RealTimeTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    // Fetch order details
    async function loadOrder() {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load order", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Simulate WebSocket connection to real-time tracking
  // In production, replace with actual WebSocket connection
  useEffect(() => {
    if (!order || order.status !== "IN_TRANSIT") return;

    // Simulate connection
    setConnectionStatus("connecting");
    const connectTimeout = setTimeout(() => {
      setConnected(true);
      setConnectionStatus("connected");
    }, 1000);

    // Simulate location updates
    const locationInterval = setInterval(() => {
      setVehicleLocation({
        latitude: 40.7128 + Math.random() * 0.01,
        longitude: -74.006 + Math.random() * 0.01,
        speed: Math.floor(Math.random() * 60) + 20,
        heading: Math.floor(Math.random() * 360),
        timestamp: new Date()
      });
    }, 5000);

    return () => {
      clearTimeout(connectTimeout);
      clearInterval(locationInterval);
    };
  }, [order]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-1">Error</h2>
              <p className="text-red-600">{error || "Order not found"}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isInTransit = order.status === "IN_TRANSIT";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Real-Time Tracking
          </h1>
          <p className="text-slate-500 mt-1">
            Order #{order.orderId} - Live vehicle location and status
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
          <div
            className={`w-3 h-3 rounded-full ${
              connected ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          <span className="text-sm font-semibold text-slate-700">
            {connectionStatus === "connected"
              ? "Connected to tracking hub"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : "Disconnected"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Vehicle Location
              </h2>

              {isInTransit ? (
                <>
                  {/* Simulated Map */}
                  <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center relative overflow-hidden">
                    {vehicleLocation && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100"></div>
                        {/* Grid background */}
                        <svg
                          className="absolute inset-0 w-full h-full"
                          style={{
                            backgroundImage:
                              'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                            backgroundSize: "50px 50px"
                          }}
                        ></svg>

                        {/* Vehicle marker */}
                        <div className="absolute z-10" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                          <div
                            className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                            style={{
                              transform: `translate(-50%, -50%) rotate(${vehicleLocation.heading}deg)`
                            }}
                          >
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="mt-2 text-center text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded">
                            {vehicleLocation.speed} km/h
                          </div>
                        </div>

                        {/* Destination marker */}
                        <div className="absolute bottom-8 right-8">
                          <div className="w-6 h-6 bg-green-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            Destination
                          </p>
                        </div>

                        {/* Current location marker */}
                        <div className="absolute top-8 left-8">
                          <div className="w-6 h-6 bg-purple-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            Origin
                          </p>
                        </div>
                      </>
                    )}
                    {!vehicleLocation && (
                      <p className="text-slate-500 relative z-10">
                        Waiting for location data...
                      </p>
                    )}
                  </div>

                  {/* Location Details */}
                  {vehicleLocation && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">
                          Latitude
                        </p>
                        <p className="font-semibold text-slate-800">
                          {vehicleLocation.latitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">
                          Longitude
                        </p>
                        <p className="font-semibold text-slate-800">
                          {vehicleLocation.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">
                          Speed
                        </p>
                        <p className="font-semibold text-slate-800">
                          {vehicleLocation.speed} km/h
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">
                          Last Updated
                        </p>
                        <p className="font-semibold text-slate-800">
                          {vehicleLocation.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">
                      Vehicle not in transit yet
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Real-time tracking will be available when order status is "IN_TRANSIT"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-4">
            {/* Order Info Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Order Details
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Order ID</p>
                  <p className="font-semibold text-slate-800">
                    #{order.orderId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isInTransit ? "bg-blue-600" : "bg-green-600"
                      }`}
                    ></div>
                    <p className="font-semibold text-slate-800">
                      {order.status}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">Total Price</p>
                  <p className="font-semibold text-slate-800 text-lg">
                    ${order.totalPrice?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">
                    Created Date
                  </p>
                  <p className="font-semibold text-slate-800">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Info Card */}
            {isInTransit && order.vehicleId && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Vehicle Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">
                      Vehicle ID
                    </p>
                    <p className="font-semibold text-slate-800">
                      {order.vehicleId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase">
                      Estimated Delivery
                    </p>
                    <p className="font-semibold text-slate-800">
                      {new Date(
                        Date.now() + 2 * 60 * 60 * 1000
                      ).toLocaleTimeString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase">
                      Distance Remaining
                    </p>
                    <p className="font-semibold text-slate-800">
                      {Math.floor(Math.random() * 50) + 5} km
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Status Timeline
              </h3>

              <div className="space-y-2 text-sm">
                {["CREATED", "IN_PROGRESS", "IN_TRANSIT", "DELIVERED"].map(
                  (status) => (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          ["CREATED", "IN_PROGRESS", "IN_TRANSIT"].includes(
                            status
                          ) &&
                          ["CREATED", "IN_PROGRESS", "IN_TRANSIT", "DELIVERED"]
                            .indexOf(status) <=
                            ["CREATED", "IN_PROGRESS", "IN_TRANSIT", "DELIVERED"].indexOf(
                              order.status
                            )
                            ? "bg-green-600"
                            : "bg-slate-300"
                        }`}
                      ></div>
                      <span
                        className={
                          ["CREATED", "IN_PROGRESS", "IN_TRANSIT"].includes(
                            status
                          ) &&
                          ["CREATED", "IN_PROGRESS", "IN_TRANSIT", "DELIVERED"]
                            .indexOf(status) <=
                            ["CREATED", "IN_PROGRESS", "IN_TRANSIT", "DELIVERED"].indexOf(
                              order.status
                            )
                            ? "text-slate-800 font-semibold"
                            : "text-slate-500"
                        }
                      >
                        {status}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default RealTimeTracking;

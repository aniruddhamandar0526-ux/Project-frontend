import axiosInstance from "./axiosInstance";

// Recent orders
export async function fetchRecentOrders() {
  const response = await axiosInstance.get(
    "/manager/dashboard/orders/recent"
  );
  return response.data;
}

// Orders grouped by status (KPIs)
export async function fetchOrdersByStatus() {
  const response = await axiosInstance.get(
    "/manager/dashboard/orders/status"
  );
  return response.data;
}

// Fleet status
export async function fetchFleetStatus() {
  const response = await axiosInstance.get(
    "/manager/dashboard/fleet/status"
  );
  return response.data;
}

// Low stock alerts
export async function fetchLowStockAlerts(threshold = 10) {
  const response = await axiosInstance.get(
    `/manager/dashboard/inventory/low-stock?threshold=${threshold}`
  );
  return response.data;
}
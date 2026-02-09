import axiosInstance from "./axiosInstance";

// CUSTOMER — place order
export async function placeOrder(payload) {
  const response = await axiosInstance.post(
    "/customer/orders",
    payload
  );
  return response.data;
}

// ADMIN / MANAGER — get all orders
export async function fetchAllOrders(page = 0, size = 20) {
  const response = await axiosInstance.get(
    `/manager/orders?page=${page}&size=${size}`
  );
  return response.data;
}

// ADMIN / MANAGER — order details
export async function fetchOrderDetails(orderId) {
  const response = await axiosInstance.get(
    `/manager/orders/${orderId}`
  );
  return response.data;
}

// ADMIN / MANAGER — order items
export async function fetchOrderItems(orderId) {
  const response = await axiosInstance.get(
    `/manager/orders/${orderId}/items`
  );
  return response.data;
}

// ADMIN / MANAGER — order status history
export async function fetchOrderHistory(orderId) {
  const response = await axiosInstance.get(
    `/manager/orders/${orderId}/history`
  );
  return response.data;
}

// ADMIN / MANAGER — update order status
export async function updateOrderStatus(orderId, payload) {
  const response = await axiosInstance.put(
    `/manager/orders/${orderId}/status`,
    payload
  );
  return response.data;
}

// ADMIN / MANAGER — cancel order
export async function cancelOrder(orderId, payload) {
  const response = await axiosInstance.post(
    `/manager/orders/${orderId}/cancel`,
    payload
  );
  return response.data;
}

// CUSTOMER — get my orders
export async function fetchMyOrders() {
  const response = await axiosInstance.get(
    "/customer/orders"
  );
  return response.data;
}
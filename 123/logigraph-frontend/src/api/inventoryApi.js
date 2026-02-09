import axiosInstance from "./axiosInstance";

// View inventory of a warehouse
export async function fetchWarehouseInventory(warehouseId) {
  const response = await axiosInstance.get(
    `/manager/inventory/warehouse/${warehouseId}`
  );
  return response.data;
}

// Add stock
export async function addInventory(payload) {
  return axiosInstance.post(
    "/manager/inventory/add",
    payload
  );
}

// Adjust stock (+ / -)
export async function adjustInventory(payload) {
  return axiosInstance.post(
    "/manager/inventory/adjust",
    payload
  );
}

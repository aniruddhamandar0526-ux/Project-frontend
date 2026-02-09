import axiosInstance from "./axiosInstance";

// Get all vehicles or filter by status
export async function fetchVehicles(status) {
  const url = status
    ? `/manager/vehicles?status=${status}`
    : "/manager/vehicles";

  const response = await axiosInstance.get(url);
  return response.data;
}

// ADMIN — register vehicle
export async function registerVehicle(payload) {
  return axiosInstance.post(
    "/manager/vehicles",
    payload
  );
}

// ADMIN / MANAGER — update vehicle status
export async function updateVehicleStatus(vehicleId, payload) {
  return axiosInstance.put(
    `/manager/vehicles/${vehicleId}/status`,
    payload
  );
}

// ADMIN / MANAGER — update vehicle warehouse
export async function updateVehicleWarehouse(vehicleId, payload) {
  return axiosInstance.put(
    `/manager/vehicles/${vehicleId}/warehouse`,
    payload
  );
}

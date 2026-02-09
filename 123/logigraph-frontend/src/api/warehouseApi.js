import axiosInstance from "./axiosInstance";

export async function fetchWarehouses() {
  const response = await axiosInstance.get(
    "/warehouses/manager"
  );
  return response.data;
}

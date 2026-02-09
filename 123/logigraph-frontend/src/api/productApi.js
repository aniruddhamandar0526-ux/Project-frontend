import axiosInstance from "./axiosInstance";

export async function fetchProducts() {
  const response = await axiosInstance.get(
    "/catalog/products"
  );
  return response.data;
}

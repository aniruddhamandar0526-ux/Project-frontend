import axiosInstance from "./axiosInstance";

// Get optimal route computed by backend (Dijkstra)
export async function fetchOptimalRoute() {
  const response = await axiosInstance.get(
    "/routing/optimal-path"
  );
  return response.data;
}

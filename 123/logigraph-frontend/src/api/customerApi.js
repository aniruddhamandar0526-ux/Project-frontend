import api from "./api";

export const getCustomerProfile = () =>
  api.get("/customer/profile");

export const updateCustomerProfile = (data) =>
  api.put("/customer/profile", data);

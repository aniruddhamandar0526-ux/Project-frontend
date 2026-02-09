export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// TEMP role resolver (PHASE 1)
export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // TEMP LOGIC — replace later with API call
  // For now assume:
  // admin usernames start with "admin"
  // manager with "manager"
  const decoded = decodeJwt(token);
  if (!decoded?.sub) return null;

  if (decoded.sub.startsWith("admin")) return "ADMIN";
  if (decoded.sub.startsWith("manager")) return "MANAGER";
  return "CUSTOMER";
}

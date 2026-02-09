// src/utils/roleUtils.js

/**
 * Decode JWT payload safely
 */
function decodeToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error("Invalid JWT token", error);
    return null;
  }
}

/**
 * Get user role
 * NOTE:
 * - If backend does NOT put role in JWT,
 *   we fallback to localStorage (set after login)
 */
export function getUserRole() {
  const payload = decodeToken();

  // Case 1: role is inside JWT (ideal)
  if (payload?.role) {
    return payload.role; // ADMIN | MANAGER | CUSTOMER
  }

  // Case 2: role stored manually after login
  const storedRole = localStorage.getItem("role");
  return storedRole || null;
}

/**
 * Utility to check allowed roles
 */
export function hasRole(...allowedRoles) {
  const role = getUserRole();
  if (!role) return false;

  return allowedRoles.includes(role);
}

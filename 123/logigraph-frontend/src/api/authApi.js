const BASE_URL = "http://localhost:8082/api/auth";

/* ======================
   LOGIN
   ====================== */
export async function loginUser(credentials) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return response.json(); // { token }
}

/* ======================
   REGISTER (CUSTOMER)
   ====================== */
export async function registerUser(credentials) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  // backend returns 201 with no body
  return true;
}

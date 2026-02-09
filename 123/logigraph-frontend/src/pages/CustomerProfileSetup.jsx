import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCustomerProfile,
  updateCustomerProfile
} from "../api/customerApi";

function CustomerProfileSetup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // 🔥 Check if profile already exists
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await getCustomerProfile();
        if (res.data?.fullName) {
          navigate("/customer/dashboard");
        }
      } catch {
        // ignore – user stays on setup
      }
    }
    checkProfile();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await updateCustomerProfile({ fullName, phone });
      toast.success("Profile updated successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Complete Your Profile
        </h2>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded mb-6"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
}

export default CustomerProfileSetup;

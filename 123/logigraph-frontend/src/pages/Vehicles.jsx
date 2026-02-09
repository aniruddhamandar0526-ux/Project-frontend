import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import {
  fetchVehicles,
  registerVehicle,
  updateVehicleStatus,
  updateVehicleWarehouse,
} from "../api/vehicleApi";
import { fetchWarehouses } from "../api/warehouseApi";
import { isMockAuthEnabled, mockUser } from "../utils/mockAuth";

const STATUS_OPTIONS = [
  "AVAILABLE",
  "IN_TRANSIT",
  "MAINTENANCE",
];

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const isAdmin =
    isMockAuthEnabled ? mockUser.role === "ADMIN" : true;

  async function loadData() {
    const [v, w] = await Promise.all([
      fetchVehicles(),
      fetchWarehouses(),
    ]);
    setVehicles(v);
    setWarehouses(w);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRegister() {
    await registerVehicle({
      vehicleNumber,
      warehouseId: Number(warehouseId),
    });
    setVehicleNumber("");
    setWarehouseId("");
    toast.success("Vehicle registered successfully");
    loadData();
  }

  async function handleStatusChange(vehicleId, status) {
    await updateVehicleStatus(vehicleId, { status });
    toast.success("Vehicle status updated");
    loadData();
  }

  async function handleWarehouseChange(vehicleId, newWarehouseId) {
    await updateVehicleWarehouse(vehicleId, {
      warehouseId: Number(newWarehouseId),
    });
    toast.success("Vehicle warehouse updated");
    loadData();
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Fleet Management
      </h1>

      {/* REGISTER VEHICLE — ADMIN ONLY */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="font-semibold mb-4">
            Register Vehicle
          </h2>

          <div className="flex gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChange={(e) =>
                setVehicleNumber(e.target.value)
              }
            />

            <select
              className="border p-2 rounded"
              value={warehouseId}
              onChange={(e) =>
                setWarehouseId(e.target.value)
              }
            >
              <option value="">
                Select Warehouse
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleRegister}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* VEHICLE TABLE */}
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Number</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="p-2 border">{v.id}</td>
                  <td className="p-2 border">
                    {v.vehicleNumber}
                  </td>
                  <td className="p-2 border">
                    <select
                      value={v.status}
                      onChange={(e) =>
                        handleStatusChange(
                          v.id,
                          e.target.value
                        )
                      }
                      className="border rounded p-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border">
                    <select
                      value={v.warehouseId}
                      onChange={(e) =>
                        handleWarehouseChange(
                          v.id,
                          e.target.value
                        )
                      }
                      className="border rounded p-1"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}

export default Vehicles;

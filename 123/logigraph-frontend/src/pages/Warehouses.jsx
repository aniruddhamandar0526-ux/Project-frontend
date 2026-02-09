import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { fetchWarehouses } from "../api/warehouseApi";
import { fetchWarehouseInventory } from "../api/inventoryApi";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const data = await fetchWarehouses();
        setWarehouses(data);
      } catch {
        setError("Failed to load warehouses");
      } finally {
        setLoading(false);
      }
    }

    loadWarehouses();
  }, []);

  async function handleWarehouseClick(warehouse) {
    setSelectedWarehouse(warehouse);
    try {
      const data = await fetchWarehouseInventory(warehouse.id);
      setInventory(data);
    } catch {
      setInventory([]);
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Warehouses
      </h1>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Address</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr
                    key={w.id}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleWarehouseClick(w)}
                  >
                    <td className="p-2 border">{w.id}</td>
                    <td className="p-2 border font-medium">
                      {w.name}
                    </td>
                    <td className="p-2 border">{w.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedWarehouse && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Inventory — {selectedWarehouse.name}
              </h2>

              {inventory.length === 0 ? (
                <p className="text-gray-500">
                  No inventory records found.
                </p>
              ) : (
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Product ID</th>
                      <th className="p-2 border">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">
                          {item.productId}
                        </td>
                        <td className="p-2 border">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

export default Warehouses;

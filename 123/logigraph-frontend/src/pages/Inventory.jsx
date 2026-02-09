import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { fetchProducts } from "../api/productApi";
import {
  fetchWarehouseInventory,
  addInventory,
  adjustInventory,
} from "../api/inventoryApi";
import { fetchWarehouses } from "../api/warehouseApi";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [inventory, setInventory] = useState([]);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      const [p, w] = await Promise.all([
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setProducts(p);
      setWarehouses(w);
    }

    loadInitialData();
  }, []);

  async function loadInventory(warehouseId) {
    const data = await fetchWarehouseInventory(warehouseId);
    setInventory(data);
  }

  async function handleAddStock() {
    await addInventory({
      warehouseId: Number(selectedWarehouse),
      productId: Number(productId),
      quantity: Number(quantity),
    });

    toast.success("Stock added successfully");
    loadInventory(selectedWarehouse);
  }

  async function handleAdjustStock() {
    await adjustInventory({
      warehouseId: Number(selectedWarehouse),
      productId: Number(productId),
      delta: Number(quantity),
    });

    toast.success("Stock adjusted successfully");
    loadInventory(selectedWarehouse);
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">
        Inventory Management
      </h1>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border p-2 rounded"
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              loadInventory(e.target.value);
            }}
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleAddStock}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>

            <button
              onClick={handleAdjustStock}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Adjust
            </button>
          </div>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Warehouse Inventory
          </h2>

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
        </div>
      )}
    </AppLayout>
  );
}

export default Inventory;

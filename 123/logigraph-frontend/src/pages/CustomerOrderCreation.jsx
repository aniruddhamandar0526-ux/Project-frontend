import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { fetchProducts } from "../api/productApi";
import { placeOrder } from "../api/orderApi";
import { Loader2, Trash2 } from "lucide-react";

function CustomerOrderCreation() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load products", err);
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Handle quantity change
  function handleQuantityChange(productId, quantity) {
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      const { [productId]: _, ...rest } = selectedItems;
      setSelectedItems(rest);
    } else {
      setSelectedItems({
        ...selectedItems,
        [productId]: qty
      });
    }
  }

  // Remove item from order
  function handleRemoveItem(productId) {
    const { [productId]: _, ...rest } = selectedItems;
    setSelectedItems(rest);
  }

  // Handle order submission
  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    const items = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      }));

    if (items.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    try {
      setSubmitting(true);
      await placeOrder({
        items,
        deliveryAddress: deliveryAddress.trim()
      });

      toast.success("Order placed successfully!");
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to place order", err);
      const message =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate total price
  const totalPrice = selectedItems
    ? Object.entries(selectedItems).reduce((sum, [productId, qty]) => {
        const product = products.find(p => p.id === parseInt(productId));
        return sum + (product?.price || 0) * qty;
      }, 0)
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create New Order</h1>
          <p className="text-slate-500 mt-1">
            Select products and provide delivery details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Select Products
            </h2>

            {products.length === 0 ? (
              <p className="text-slate-500">No products available</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex gap-4 p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-700">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {product.description || "No description"}
                      </p>
                      <p className="text-sm text-blue-600 font-semibold mt-1">
                        ${product.price?.toFixed(2) || "0.00"} per unit
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={product.stock || 1000}
                        value={selectedItems[product.id] || 0}
                        onChange={(e) =>
                          handleQuantityChange(product.id, e.target.value)
                        }
                        className="w-20 px-2 py-2 border rounded text-center"
                        placeholder="Qty"
                      />
                      {selectedItems[product.id] > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {Object.keys(selectedItems).length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 mb-4">
                {Object.entries(selectedItems)
                  .filter(([, qty]) => qty > 0)
                  .map(([productId, qty]) => {
                    const product = products.find(
                      p => p.id === parseInt(productId)
                    );
                    return (
                      <div
                        key={productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {product?.name} × {qty}
                        </span>
                        <span className="font-semibold text-slate-700">
                          ${(product?.price * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-4 border-t border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-800">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Delivery Address
            </h2>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Complete Address *
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street address, City, State, ZIP code"
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Please provide complete address for accurate delivery
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/customer/dashboard")}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Object.keys(selectedItems).length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default CustomerOrderCreation;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { fetchProducts } from "../api/productApi";
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react";

function ProductCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (product.category?.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category || "uncategorized"))
  ];

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Product Catalog
          </h1>
          <p className="text-slate-500 mt-1">
            Browse our complete inventory and place orders
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-1">No products found</p>
            <p className="text-slate-500 text-sm">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No products available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => navigate("/customer/create-order")}
              />
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredProducts.length > 0 && (
          <div className="text-center text-sm text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ProductCard({ product, onAddToCart }) {
  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
    >
      {/* Product Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative overflow-hidden">
        <ShoppingCart className="w-12 h-12 text-slate-400" />
        {product.stock && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            In Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-800 line-clamp-2">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-xs text-slate-500 mt-1">
              {product.category}
            </p>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price?.toFixed(2) || "0.00"}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-500 line-through">
              ${product.originalPrice?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="text-xs text-slate-600">
          {product.stock !== undefined && (
            <>Stock: {product.stock > 0 ? product.stock : "Out of stock"}</>
          )}
        </div>

        {/* Specs (if available) */}
        {product.specifications && (
          <div className="text-xs space-y-1 py-2 border-t border-slate-200">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="text-slate-600">
                <span className="font-medium capitalize">{key}:</span>{" "}
                {value}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className="w-full py-2 mt-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          {product.stock === 0 ? "Out of Stock" : "Add to Order"}
        </button>
      </div>
    </div>
  );
}

export default ProductCatalog;

import { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { productAPI, orderAPI } from '../../api/client';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export default function CustomerCreateOrder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState({
    deliveryLocation: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    // Normalize price with fallback chain
    const price = product.price || product.unitPrice || product.cost || 0;
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, price, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Product removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Please add products to your order');
      return;
    }

    if (!orderData.deliveryLocation.trim()) {
      toast.error('Please enter delivery location');
      return;
    }

    try {
      setSubmitting(true);

      // Build items map expected by backend: { productId: quantity }
      const itemsMap = {};
      cart.forEach(item => {
        itemsMap[item.id] = item.quantity;
      });

      // Geocode delivery address to lat/lng using OpenStreetMap Nominatim
      async function geocodeAddress(address) {
        const attempts = [];

        // Try original address and normalized variants
        attempts.push(address);
        attempts.push(address.replace(/\n+/g, ', '));
        const parts = address.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) attempts.push(parts.slice(-2).join(', '));
        if (parts.length >= 1) attempts.push(parts[0]);

        for (const q of attempts) {
          try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            if (!res.ok) {
              console.warn('Nominatim returned non-OK status', res.status, q);
              continue;
            }
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
          } catch (err) {
            console.warn('Geocode attempt failed for query', q, err);
          }
        }

        // Final fallback: if address contains a known city, try a city-level fallback
        if (/pune/i.test(address)) {
          return { lat: 18.5204, lng: 73.8567 };
        }

        throw new Error('Failed to geocode delivery address');
      }

      const coords = await geocodeAddress(orderData.deliveryLocation);

      const payload = {
        items: itemsMap,
        destLat: coords.lat,
        destLng: coords.lng,
      };

      await orderAPI.createOrder(payload);
      toast.success('Order created successfully!');



      setCart([]);
      setOrderData({ deliveryLocation: '', notes: '' });
    } catch (error) {
      console.error('Failed to create order:', error);
      
      // Check if error is due to warehouse fulfillment constraint
      const msg = error.response?.data?.message || error.message || '';
      if (msg.includes('No warehouse can fulfill all requested items')) {
        toast.error(
          'This product combination is not available from a single warehouse. ' +
          'Please try removing some items and placing a separate order, or contact support.'
        );
      } else {
        toast.error(error.response?.data?.message || 'Failed to create order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout title="Create Order">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Create Order">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>
          {products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">No products available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{(product.price || product.unitPrice || product.cost || 0)?.toFixed(2)}
                      </p>
                    </div>
                    {(product.stock && product.stock > 0) && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock && product.stock > 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    {product.stock && product.stock > 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Your Cart
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">₹{item.price?.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 border rounded hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-12 border rounded text-center px-2 py-1"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border rounded hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="ml-auto font-medium text-gray-900">
                          ₹{(item.price * item.quantity)?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Location
                    </label>
                    <textarea
                      value={orderData.deliveryLocation}
                      onChange={(e) => setOrderData({ ...orderData, deliveryLocation: e.target.value })}
                      placeholder="Enter delivery address"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                      placeholder="Add special instructions"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-bold"
                  >
                    {submitting ? 'Creating Order...' : 'Place Order'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

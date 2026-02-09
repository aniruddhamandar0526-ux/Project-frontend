import { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { orderAPI } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Package } from 'lucide-react';

export default function CustomerMyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(0, 100);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status?.toUpperCase() === filter.toUpperCase());

  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return statusMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <CustomerLayout title="My Orders">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="My Orders">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          {['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/customer/create-order')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Place Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="grid md:grid-cols-6 gap-4 items-start">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-bold text-gray-900">#{order.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-blue-600">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="font-bold text-gray-900">{order.itemCount || order.items?.length || 0} items</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Delivery Location</p>
                    <p className="text-gray-900 text-sm truncate">{order.deliveryLocation || 'N/A'}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/customer/track/${order.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

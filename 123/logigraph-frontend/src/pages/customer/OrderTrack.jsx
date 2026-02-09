import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { orderAPI, trackingServiceAPI } from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Truck, CheckCircle, Package } from 'lucide-react';

export default function CustomerOrderTrack() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      
      // Load order details
      const orderResponse = await orderAPI.getById(orderId);
      setOrder(orderResponse.data);

      // Try to load tracking info
      try {
        const trackingResponse = await trackingServiceAPI.getTracking(orderId);
        setTracking(trackingResponse.data);
      } catch {
        console.log('Tracking data not available yet');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Package className="w-6 h-6 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'IN_TRANSIT':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

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
      <CustomerLayout title="Track Order">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout title="Track Order">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate('/customer/my-orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Orders
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const statuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(order.status?.toUpperCase());

  return (
    <CustomerLayout title="Track Order">
      <div className="space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate('/customer/my-orders')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-bold text-lg text-gray-900">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(order.status)}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-lg text-blue-600">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-bold text-lg text-gray-900">{order.itemCount || order.items?.length || 0}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Delivery Location</h3>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900">{order.deliveryLocation || 'N/A'}</p>
                {order.notes && (
                  <p className="text-gray-600 text-sm mt-2">Notes: {order.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 mb-8">Order Status Timeline</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-300"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {statuses.map((status, index) => (
                <div key={status} className="relative pl-20">
                  {/* Circle */}
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      index <= currentStatusIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-white'
                    }`}
                  >
                    {index < currentStatusIndex ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="font-bold text-gray-900">{status.replace('_', ' ')}</h4>
                    <p className="text-gray-600 text-sm">
                      {index <= currentStatusIndex
                        ? `Completed on ${new Date(order.createdAt).toLocaleDateString()}`
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Tracking (if available) */}
        {tracking && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Live Tracking
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Location</p>
                <p className="font-bold text-gray-900">{tracking.currentLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-bold text-gray-900">{tracking.vehicleNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-bold text-gray-900">{tracking.estimatedDelivery || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-bold text-gray-900">{tracking.driverName || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName || item.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

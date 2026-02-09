import { useState } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { ShoppingCart, Package, MapPin } from 'lucide-react';

export default function CustomerDashboard() {
  const [loading] = useState(false);

  return (
    <CustomerLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-10 h-10 text-blue-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Create Order</h3>
                  <p className="text-gray-900 font-semibold">Place a new order</p>
                </div>
              </div>
              <a href="/customer/create-order" className="text-blue-600 text-sm hover:underline mt-4 block font-medium">
                Create Order →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <Package className="w-10 h-10 text-indigo-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">My Orders</h3>
                  <p className="text-gray-900 font-semibold">View all your orders</p>
                </div>
              </div>
              <a href="/customer/my-orders" className="text-indigo-600 text-sm hover:underline mt-4 block font-medium">
                View Orders →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <MapPin className="w-10 h-10 text-green-600" />
                <div>
                  <h3 className="text-gray-600 text-sm font-semibold">Track Order</h3>
                  <p className="text-gray-900 font-semibold">Real-time tracking</p>
                </div>
              </div>
              <a href="/customer/my-orders" className="text-green-600 text-sm hover:underline mt-4 block font-medium">
                Track Now →
              </a>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to LogiGraph!</h2>
            <p className="text-lg mb-6 max-w-2xl">
              Your reliable partner for fast and efficient order delivery. Track your shipments in real-time and manage all your orders from one convenient dashboard.
            </p>
            <a href="/customer/create-order" className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
              Place Your First Order
            </a>
          </div>

          {/* Getting Started Guide */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Get Started</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Your Order</h4>
                  <p className="text-gray-600 text-sm">Click "Create Order" to start placing your shipment</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Confirm Details</h4>
                  <p className="text-gray-600 text-sm">Select items and specify delivery location</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Track Delivery</h4>
                  <p className="text-gray-600 text-sm">Real-time tracking from warehouse to your door</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-gray-900 mb-3">📦 Easy Ordering</h4>
              <p className="text-gray-600 text-sm">
                Simple and intuitive order creation process. Select from our catalog and arrange delivery.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-gray-900 mb-3">🚚 Real-Time Tracking</h4>
              <p className="text-gray-600 text-sm">
                Track your shipments in real-time with live GPS updates and estimated delivery times.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-gray-900 mb-3">💬 24/7 Support</h4>
              <p className="text-gray-600 text-sm">
                Get help whenever you need it with our dedicated customer support team.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-gray-900 mb-3">⚡ Fast Delivery</h4>
              <p className="text-gray-600 text-sm">
                Optimized routing ensures your orders arrive quickly and reliably.
              </p>
            </div>
          </div>
        </>
      )}
    </CustomerLayout>
  );
}

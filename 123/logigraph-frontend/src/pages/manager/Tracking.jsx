import ManagerLayout from '../../components/ManagerLayout';

export default function ManagerTracking() {
  return (
    <ManagerLayout title="Real-Time Tracking">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Order Tracking</h2>
        <p className="text-gray-600 mb-6">Tracking interface coming soon.</p>
        <p className="text-sm text-gray-500">Features: WebSocket tracking, Live location updates, Delivery status</p>
      </div>
    </ManagerLayout>
  );
}

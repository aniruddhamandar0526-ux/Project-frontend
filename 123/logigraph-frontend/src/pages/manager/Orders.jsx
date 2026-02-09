import ManagerLayout from '../../components/ManagerLayout';

export default function ManagerOrders() {
  return (
    <ManagerLayout title="Orders Management">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders Management</h2>
        <p className="text-gray-600 mb-6">Order management interface coming soon.</p>
        <p className="text-sm text-gray-500">Features: View, Filter, Update status, Cancel orders</p>
      </div>
    </ManagerLayout>
  );
}

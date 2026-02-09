import ManagerLayout from '../../components/ManagerLayout';

export default function ManagerVehicles() {
  return (
    <ManagerLayout title="Vehicles Management">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Fleet Management</h2>
        <p className="text-gray-600 mb-6">Vehicle management interface coming soon.</p>
        <p className="text-sm text-gray-500">Features: Register vehicles, Update status, Change warehouse, View fleet</p>
      </div>
    </ManagerLayout>
  );
}

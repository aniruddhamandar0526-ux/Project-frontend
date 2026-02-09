import ManagerLayout from '../../components/ManagerLayout';

export default function ManagerInventory() {
  return (
    <ManagerLayout title="Inventory Management">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
        <p className="text-gray-600 mb-6">Inventory management interface coming soon.</p>
        <p className="text-sm text-gray-500">Features: View stock, Add stock, Adjust quantities, Low stock alerts</p>
      </div>
    </ManagerLayout>
  );
}

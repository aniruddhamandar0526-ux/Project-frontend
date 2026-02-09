import AdminLayout from '../../components/AdminLayout';

export default function AdminCustomers() {
  return (
    <AdminLayout title="Customers Management">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Management</h2>
        <p className="text-gray-600 mb-6">Customer management interface coming soon.</p>
        <p className="text-sm text-gray-500">Features: Create, Read, Update, Delete customer profiles</p>
      </div>
    </AdminLayout>
  );
}

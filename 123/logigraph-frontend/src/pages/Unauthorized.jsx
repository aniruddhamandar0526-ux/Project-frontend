import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">You don't have permission to access this resource.</p>
        <a href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Go Home
        </a>
      </div>
    </div>
  );
}

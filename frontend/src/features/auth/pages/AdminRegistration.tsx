import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AdminRegistration() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin account access</h1>
          <p className="text-gray-500">Administrator accounts are provisioned by a trusted project administrator.</p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Contact your project administrator to request access, then sign in with your provisioned account.
        </div>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

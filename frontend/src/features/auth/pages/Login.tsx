import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthFlowError, authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const { syncAuthenticatedUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: { value: UserRole; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'technician', label: 'Technician' },
    { value: 'admin', label: 'Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const user = await authService.login(email, password);
      
      // 2. Strict Role Verification
      const profile = await syncAuthenticatedUser(user);
      
      if (!profile) {
        await authService.logout();
        throw new AuthFlowError(
          'profile/not-found',
          'No Firestore profile is linked to this account. Ask an administrator to restore the matching users/{uid} profile.',
        );
      }

      if (!['customer', 'technician', 'admin'].includes(profile.role)) {
        await authService.logout();
        throw new AuthFlowError('profile/invalid-role', 'This account has an unsupported role. Contact support.');
      }

      if (profile.role !== selectedRole) {
        // Reject login
        await authService.logout();
        throw new AuthFlowError(
          'profile/role-mismatch',
          `Access denied. This account is registered as a ${profile.role}, but you attempted to login as a ${selectedRole}.`,
        );
      }

      // Check email verification if required by your flow (Optional for MVP, but good practice)
      // We'll allow them in for now, but in reality we could block unverified emails.
      if (!user.emailVerified) {
        if (profile.role === 'admin') {
          await authService.logout();
          throw new AuthFlowError('auth/email-not-verified', 'Please verify your email before accessing the Admin Portal.');
        }
        navigate('/verify-email');
        return;
      }

      // 3. Success
      if (profile.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (profile.role === 'technician') {
        navigate('/technician/dashboard');
      } else if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        throw new Error('Unable to determine the account destination.');
      }
      
    } catch (error: unknown) {
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        && typeof error.code === 'string'
        ? error.code
        : undefined;

      if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(errorCode ?? '')) {
        setError('Incorrect email or password.');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Enter a valid email address.');
      } else if (errorCode === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (errorCode === 'permission-denied') {
        setError('Your credentials were accepted, but Firestore denied access to your account profile. Ask the project administrator to verify the deployed users/{uid} read rule.');
      } else if (['unavailable', 'deadline-exceeded', 'auth/network-request-failed'].includes(errorCode ?? '')) {
        setError('Could not reach Firebase to load your account profile. Check your connection and try again.');
      } else if (['auth/invalid-api-key', 'auth/project-not-found', 'auth/unauthorized-domain', 'auth/operation-not-allowed'].includes(errorCode ?? '')) {
        setError('Firebase Authentication is not configured for this app. Contact the project administrator.');
      } else if (error instanceof AuthFlowError) {
        setError(error.message);
      } else {
        setError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center text-blue-600 mb-2">
            <Home size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">SmartAssist AI</h1>
          <p className="text-sm text-gray-500 font-medium">Smart Home Support Platform</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm">Manage your devices, troubleshoot problems, and track service requests.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sign in as</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === role.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <div className="space-y-1">
            <Input 
              label="Password" 
              isPassword 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth isLoading={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </div>
        </form>

        {selectedRole === 'admin' ? (
          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an admin account?{' '}
            <Link to="/register/admin" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Create an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

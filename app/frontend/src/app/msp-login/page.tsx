'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mspApiService, MSPUser } from '@/lib/mspApi';

export default function MSPLoginPage() {
  const [selectedRole, setSelectedRole] = useState<'CA_ADMIN' | 'STUDENT' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<MSPUser | null>(null);
  const router = useRouter();

  const handleRoleSelection = async (role: 'CA_ADMIN' | 'STUDENT') => {
    setIsLoading(true);
    setError(null);
    setSelectedRole(role);

    try {
      const authResult = await mspApiService.authenticateUser(role);

      if (authResult.success && authResult.user) {
        setUser(authResult.user);

        // Store user info in localStorage for session management
        localStorage.setItem('mspUser', JSON.stringify(authResult.user));

        // Redirect based on role
        if (role === 'CA_ADMIN') {
          router.push('/ca-admin-dashboard');
        } else {
          router.push('/student-dashboard');
        }
      } else {
        setError(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mspUser');
    setUser(null);
    setSelectedRole(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MSP-Based Authentication
          </h1>
          <p className="text-gray-600">
            Choose your role to access the system
          </p>
        </div>

        {user ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ✅ Authentication Successful
              </div>
              <div className="text-sm text-gray-700">
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>MSP ID:</strong> {user.mspId}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelection('CA_ADMIN')}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading && selectedRole === 'CA_ADMIN' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="text-left">
                    <div className="font-semibold">CA Administrator</div>
                    <div className="text-sm opacity-90">University Admin Access</div>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleRoleSelection('STUDENT')}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading && selectedRole === 'STUDENT' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="text-left">
                    <div className="font-semibold">Student</div>
                    <div className="text-sm opacity-90">Student Access</div>
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">About MSP Authentication</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>CA Admin:</strong> Can create, update, delete certificates</p>
                <p>• <strong>Student:</strong> Can view their own certificates</p>
                <p>• Authentication uses Fabric MSP certificates</p>
                <p>• No wallet signatures required</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

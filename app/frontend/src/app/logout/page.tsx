"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = () => {
      // Clear all authentication state
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');

      // Clear any credential data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('credential_')) {
          localStorage.removeItem(key);
        }
      });

      console.log('✅ Logout completed, redirecting to login');

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Logging out...</h2>
        <p className="text-gray-600">Clearing your session and redirecting to login</p>
      </div>
    </div>
  );
}

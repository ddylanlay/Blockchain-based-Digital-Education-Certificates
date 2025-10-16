"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletService } from '../services/walletService';
import FabricAssetManager from '@/components/FabricAssetManager';

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkWalletConnection = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;

      try {
        // Check localStorage for explicit connection state
        const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
        const walletAddress = localStorage.getItem('walletAddress');
        const verifierToken = localStorage.getItem('verifier_token');

        console.log('🔍 Home page wallet check:');
        console.log('  - isWalletConnected:', isWalletConnected);
        console.log('  - walletAddress:', walletAddress);
        console.log('  - verifierToken:', verifierToken ? 'present' : 'not present');

        if (isWalletConnected && walletAddress) {
          // Check if user is a verifier
          if (verifierToken) {
            // Verifier logged in, redirect to verifier dashboard
            console.log('Verifier detected, redirecting to verifier dashboard');
            router.push('/verifier-dashboard');
            return;
          }

          // Students will stay on the main page (Credential Wallet Manager)
          // No need to redirect - they can view their certificates here

          // Double-check with WalletService for other users
          const walletService = new WalletService();
          const hasAccounts = await walletService.checkConnection();

          if (hasAccounts) {
            setIsConnected(true);
          } else {
            // Clear invalid connection state
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
            router.push('/login');
          }
        } else {
          // No connection state, redirect to login (only once)
          if (!hasRedirected) {
            console.log('No wallet connection found, redirecting to login');
            setHasRedirected(true);
            router.push('/login');
          }
        }
      } catch (error) {
        console.log('No wallet connection, redirecting to login');
        // Clear any invalid state
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('verifier_token');
        localStorage.removeItem('verifier_user');
        if (!hasRedirected) {
          setHasRedirected(true);
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, [router, hasRedirected]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FabricAssetManager />
    </div>
  );
}

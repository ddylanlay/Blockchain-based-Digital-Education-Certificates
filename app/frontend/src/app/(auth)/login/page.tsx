"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { WalletService } from '../../../services/walletService';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [walletService] = useState(new WalletService());
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if already connected to our app
    const checkExistingConnection = async () => {
      try {
        // Check localStorage for explicit connection state
        const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
        const walletAddress = localStorage.getItem('walletAddress');

        if (isWalletConnected && walletAddress) {
          // Already connected to our app, redirect to main page
          console.log('User already connected, redirecting to main app');
          router.push('/');
        } else {
          console.log('No app connection found, staying on login page');
        }
      } catch (error) {
        console.log('No existing wallet connection');
      }
    };

    checkExistingConnection();
  }, [walletService, router]);

  const connectWallet = async () => {
    if (!isClient) return;

    setIsConnecting(true);
    setError(null);

    try {
      console.log('🔄 Connecting to MetaMask...');

      // Connect to MetaMask
      const address = await walletService.connectWallet();

      console.log('✅ Wallet connected:', address);

      // Store connection state in localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);

      // Redirect to main page
      router.push('/');

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Credential Wallet
          </h1>
          <p className="text-gray-600">
            Connect your MetaMask wallet to access your credentials
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* MetaMask Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connect with MetaMask
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Your wallet is your secure gateway to your blockchain credentials
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Connection Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
                isConnecting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect MetaMask Wallet</span>
                </>
              )}
            </button>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Secure wallet-based authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Your credentials stay in your control</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Blockchain-verified authenticity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Don't have MetaMask?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Download here
            </a>
          </p>
        </div>

        {/* MetaMask Not Detected Warning */}
        {typeof window !== 'undefined' && !window.ethereum && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">MetaMask Not Detected</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please install MetaMask browser extension to continue.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Install MetaMask →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


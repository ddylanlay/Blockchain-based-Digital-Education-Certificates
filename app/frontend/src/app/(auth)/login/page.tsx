"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader2, GraduationCap, Key, User } from 'lucide-react';
import { WalletService } from '../../../services/walletService';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [walletService] = useState(new WalletService());
  const [loginMode, setLoginMode] = useState<'student' | 'verifier'>('student');
  const [authMessage, setAuthMessage] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [seedPassword, setSeedPassword] = useState<string>('');
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
        const verifierToken = localStorage.getItem('verifier_token');

        if (isWalletConnected && walletAddress) {
          if (verifierToken) {
            // Verifier already logged in, redirect to verifier dashboard
            console.log('Verifier already logged in, redirecting to verifier dashboard');
            router.push('/verifier-dashboard');
          } else {
            // Student already connected, redirect to main page
            console.log('Student already connected, redirecting to main app');
            router.push('/');
          }
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
      setWalletAddress(address);

      if (loginMode === 'verifier') {
        // Get authentication message from backend for verifier
        const response = await fetch('http://localhost:3002/api/auth/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: address }),
        });

        const data = await response.json();

        if (data.success) {
          setAuthMessage(data.message);
          console.log('✅ Auth message received:', data.message);
        } else {
          throw new Error(data.error || 'Failed to get authentication message');
        }
      } else {
        // Student login - just store connection and redirect
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
        console.log('✅ Student wallet connected:', address);
        router.push('/');
      }

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
  };
  const signAndLoginAsVerifier = async () => {
    if (!authMessage || !walletAddress) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Sign the authentication message
      const signature = await walletService.signMessage(authMessage);
      console.log('✅ Message signed:', signature);

      // Send login request to backend
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message: authMessage
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('verifier_token', data.token);
        localStorage.setItem('verifier_user', JSON.stringify(data.user));
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', walletAddress);

        console.log('✅ Verifier login successful');

        // Redirect to verifier dashboard
        router.push('/verifier-dashboard');
      } else {
        throw new Error(data.error || 'Login failed');
      }

    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const seedAdminLogin = async () => {
    if (!seedPassword) {
      setError('Please enter the admin password');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3002/api/auth/seed-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: seedPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('verifier_token', data.token);
        localStorage.setItem('verifier_user', JSON.stringify(data.user));
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', data.user.walletAddress);

        console.log('✅ Seed admin login successful');

        // Redirect to verifier dashboard
        router.push('/verifier-dashboard');
      } else {
        throw new Error(data.error || 'Login failed');
      }

    } catch (error) {
      console.error('❌ Seed login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Education Credential System
          </h1>
          <p className="text-gray-600">
            Access your credentials or manage as a university administrator
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Login Mode Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setLoginMode('student');
                  setError(null);
                  setWalletAddress('');
                  setAuthMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Student
              </button>
              <button
                onClick={() => {
                  setLoginMode('verifier');
                  setError(null);
                  setWalletAddress('');
                  setAuthMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'verifier'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 inline mr-2" />
                University Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {loginMode === 'student' ? (
            // Student Login
            <div className="space-y-6">
              <div className="text-center">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Student Login
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Connect your MetaMask wallet to access your credentials
                </p>
              </div>

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

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>View your educational credentials</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Verify credential authenticity</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Share credentials securely</span>
                </div>
              </div>
            </div>
          ) : (
            // Verifier Login
            <div className="space-y-6">
              <div className="text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  University Admin Login
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Access the verifier dashboard to issue credentials
                </p>
              </div>

              {!walletAddress ? (
                <div className="space-y-4">
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect MetaMask
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">Or login as seed admin for testing:</p>
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={seedPassword}
                        onChange={(e) => setSeedPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={seedAdminLogin}
                        disabled={isConnecting || !seedPassword}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <Key className="w-5 h-5 mr-2" />
                            Login as Seed Admin
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-400">Password: admin123</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-green-600 font-mono break-all">
                      {walletAddress}
                    </p>
                  </div>

                  {authMessage && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">
                          Sign the message below to verify your identity as a verifier
                        </p>
                      </div>

                      <button
                        onClick={signAndLoginAsVerifier}
                        disabled={isConnecting}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Signing & Logging in...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Sign & Login as Verifier
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Issue educational credentials</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Manage credential status</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>View credential history</span>
                </div>
              </div>
            </div>
          )}
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


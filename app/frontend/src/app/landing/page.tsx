"use client";

import React from 'react';
import { Wallet, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Credential Wallet</span>
            </div>
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Your Academic Credentials
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Store, verify, and share your educational certificates using blockchain technology.
            Your credentials, your control, verified on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect MetaMask</span>
            </Link>
            <button className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-lg font-semibold">
              <Shield className="w-5 h-5" />
              <span>Learn More</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Wallet-Based Storage</h3>
            <p className="text-gray-600">
              Your credentials are stored securely in your MetaMask wallet. You maintain full control and ownership.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Blockchain Verification</h3>
            <p className="text-gray-600">
              Cryptographic hashes are stored on Hyperledger Fabric for tamper-proof verification.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Verification</h3>
            <p className="text-gray-600">
              Verify the authenticity of any credential instantly using blockchain technology.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600 text-sm">Connect your MetaMask wallet to access the platform</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Store Credentials</h3>
              <p className="text-gray-600 text-sm">Add your academic certificates to your wallet</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blockchain Hash</h3>
              <p className="text-gray-600 text-sm">A cryptographic hash is stored on the blockchain</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share & Verify</h3>
              <p className="text-gray-600 text-sm">Share credentials and verify authenticity instantly</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Connect your MetaMask wallet and start managing your credentials securely.</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect MetaMask Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Credential Wallet. Built with Hyperledger Fabric & MetaMask.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

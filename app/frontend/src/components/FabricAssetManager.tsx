"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit, Trash2, Send, Check, X, RefreshCw } from 'lucide-react';
import { WalletService, Credential } from '../services/walletService';
import { Wallet } from 'lucide-react';

interface Asset {
  id: string;
  owner: string;
  department: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  certificateType: string;
  issueDate: string;
  status: string;
  txHash: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  valid?: boolean;
}

const API_BASE_URL = 'http://localhost:3001/api';

export default function FabricAssetManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({});
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    id: '',
    owner: '',
    department: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    certificateType: '',
    txHash: ''
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletService] = useState(new WalletService());
  const [walletCredentials, setWalletCredentials] = useState<Credential[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Fetch all assets
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching fresh assets from blockchain...');
      const response = await fetch(`${API_BASE_URL}/assets`);
      const result: ApiResponse<Asset[]> = await response.json();

      if (result.success) {
        console.log('✅ Fresh assets from blockchain:', result.data?.map(a => a.id));
        setAssets(result.data || []);

        // Clear any stale data
        if (result.data?.length === 0) {
          console.log('�� No assets found in blockchain - clearing local state');
        }
      } else {
        setError(result.error || 'Failed to fetch assets');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new asset
  const createAsset = async () => {
    if (!newAsset.id || !newAsset.owner || !newAsset.department) {
      setError('ID, Owner, and Department are required');
      return;
    }

    setLoading(true);
    try{
      // map frontend data to backend
      const backendAsset ={
          id: newAsset.id,
          owner: newAsset.owner,
          department: newAsset.department,
          academicYear: newAsset.academicYear,
          startDate: newAsset.startDate,
          endDate: newAsset.endDate,
          certificateType: newAsset.certificateType,
      }

      // HTTP POST request to backend
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendAsset),  // Use mapped object
      });

      const result: ApiResponse<any> = await response.json();

      // success response after asset is created and stored in blockchain ledger (on chaincode side)
      if (result.success) {
        await fetchAssets();
        setShowCreateForm(false);
        setNewAsset({
          id: '',
          owner: '',
          department: '',
          academicYear: '',
          startDate: '',
          endDate: '',
          certificateType: '',
        });
        setError(null);
      } else {
        setError(result.error || 'Failed to create asset');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit existing asset
const editAsset = async () => {
  alert('editAsset function called!')
  console.log('🔍 editAsset called');
  console.log('editingAsset:', editingAsset);
  console.log('editFormData:', editFormData);


  if (!editingAsset || !editFormData.id || !editFormData.owner || !editFormData.department) {
    console.log('❌ Validation failed');
    setError('ID, Owner, and Department are required');
    return;
  }

  console.log('✅ Validation passed, proceeding with update...');


  setLoading(true);
  try {
    const backendAsset = {
      id: editFormData.id,
      owner: editFormData.owner,
      department: editFormData.department,
      academicYear: editFormData.academicYear,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
      certificateType: editFormData.certificateType,
      issueDate: editFormData.issueDate,
      status: editFormData.status,
    };

    console.log('Sending update request:', backendAsset);

    // uses HTTP PUT request to backend
    const response = await fetch(`${API_BASE_URL}/assets/${editingAsset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendAsset),
    });

    console.log('Response status:', response.status);

    const result: ApiResponse<any> = await response.json();
    console.log('Response result:', result);

    if (result.success) {
      await fetchAssets();
      setEditingAsset(null);
      setEditFormData({});
      setError(null);
    } else {
      setError(result.error || 'Failed to update asset');
    }
  } catch (err) {
    setError(`Network error: ${err}`);
  } finally {
    setLoading(false);
  }
};

  // Update asset status
  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        await fetchAssets();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Transfer asset
  const transferAsset = async (id: string, newOwner: string) => {
    if (!newOwner.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwner }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        await fetchAssets();
      } else {
        setError(result.error || 'Failed to transfer asset');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // delete asset with error handling
  const deleteAsset = async (id: string) => {
    if (!confirm(`Are you sure you want to delete asset ${id}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        await fetchAssets(); // refresh the list
      } else {
        // handle asset not found error
        if (response.status === 404) {
          console.log(`Asset ${id} not found in blockchain, refreshing list...`);
          setError(`Asset ${id} not found. Refreshing asset list...`);
          await fetchAssets(); // refresh to sync with blockchain
        } else {
          setError(result.error || 'Failed to delete asset');
        }
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // wallet connection
  const connectWallet = async () => {
    try {
      console.log('🔄 Connecting wallet...');
      setLoading(true);
      setError(null);

      const address = await walletService.connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);

      // load credentials from wallet
      await loadWalletCredentials();

      console.log('✅ Wallet connected and credentials loaded');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setError('Failed to connect wallet: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // load credentials from wallet
  const loadWalletCredentials = async () => {
    try {
      const credentials = await walletService.getWalletCredentials();
      setWalletCredentials(credentials);
      console.log('✅ Loaded credentials from wallet:', credentials.length);
    } catch (error) {
      console.error('❌ Failed to load wallet credentials:', error);
    }
  };

  // create credential (store in wallet + blockchain)
  const createCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!newAsset.id || !newAsset.owner || !newAsset.department) {
      setError('ID, Owner, and Department are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // create credential object
      const credential: Credential = {
        id: newAsset.id!,
        studentName: newAsset.owner!,
        department: newAsset.department!,
        academicYear: newAsset.academicYear || '',
        startDate: newAsset.startDate || '',
        endDate: newAsset.endDate || '',
        certificateType: newAsset.certificateType || '',
        issueDate: '', // Will be set when status changes to "issued"
        status: 'draft',
        issuer: 'University ABC', // You can make this dynamic
        hash: '', // Will be set by wallet service
        signature: '' // Will be set by wallet service
      };

      // Store in wallet and get hash
      const { hash, signature } = await walletService.storeCredential(credential);

      // Send hash to blockchain
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credential,
          hash,
          signature,
          walletAddress: await walletService.getAddress()
        }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        // Refresh wallet credentials
        await loadWalletCredentials();
        setShowCreateForm(false);
        setNewAsset({
          id: '',
          owner: '',
          department: '',
          academicYear: '',
          startDate: '',
          endDate: '',
          certificateType: '',
        });
        setError(null);
        console.log('✅ Credential created and stored in wallet + blockchain');
      } else {
        setError(result.error || 'Failed to create credential');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Verify credential
const verifyCredential = async (credential: Credential) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-credential`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: credential.id,
        hash: credential.hash,
        signature: credential.signature
      }),
    });

    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      alert(`Credential ${result.valid ? 'is valid' : 'is invalid'}`);
    } else {
      alert('Verification failed: ' + result.error);
    }
  } catch (error) {
    alert('Verification failed: ' + error);
  }
};

// Share credential
const shareCredential = (credential: Credential) => {
  navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
  alert('Credential copied to clipboard!');
};

  // Load assets on component mount
  useEffect(() => {
    setIsClient(true);

    const initializeApp = async () => {
      try {
        // Check wallet connection
        const isConnected = await walletService.checkConnection();
        if (isConnected) {
          const address = await walletService.getAddress();
          setWalletAddress(address);
          setWalletConnected(true);
          await loadWalletCredentials();
        }

        // Load blockchain assets (for display purposes)
        await fetchAssets();
      } catch (error) {
        console.log('ℹ️ Initialization error:', error);
        // Still try to load blockchain assets even if wallet fails
        await fetchAssets();
      }
    };

    initializeApp();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'issued': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Wallet */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credential Wallet Manager</h1>
              <div className="flex items-center space-x-4 mt-2">
                {walletConnected ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {walletCredentials.length} credentials
                    </span>
                    <button
                      onClick={() => {
                        setWalletConnected(false);
                        setWalletAddress('');
                        setWalletCredentials([]);
                      }}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-2">Store credentials in your wallet, verify on blockchain</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={!walletConnected}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  !walletConnected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Credential
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Create Credential Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Credential</h2>

            {/* Wallet requirement warning */}
            {!walletConnected && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">
                    Please connect your wallet to create credentials
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={createCredential}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Credential ID *"
                  value={newAsset.id || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, id: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={newAsset.owner || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, owner: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Department *"
                  value={newAsset.department || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Academic Year"
                  value={newAsset.academicYear || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, academicYear: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Program Start Date"
                  value={newAsset.startDate || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Program End Date"
                  value={newAsset.endDate || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Certificate Type"
                  value={newAsset.certificateType || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, certificateType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !walletConnected}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    loading || !walletConnected
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Credential'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Wallet Credentials Display */}
        {walletConnected && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Credentials ({walletCredentials.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Credentials stored in your wallet - accessible offline
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {walletCredentials.map((credential) => (
                    <tr key={credential.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{credential.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{credential.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{credential.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{credential.certificateType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credential.status)}`}>
                          {credential.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => shareCredential(credential)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Share Credential"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => verifyCredential(credential)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify Credential"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {walletCredentials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No credentials in your wallet. Create your first credential to get started.
              </div>
            )}
          </div>
        )}

        {/* Blockchain Assets Display (for reference) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Blockchain Assets ({assets.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assets stored on Hyperledger Fabric blockchain (read-only)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {assets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assets found on blockchain
            </div>
          )}
        </div>

        {/* Wallet not connected message */}
        {!walletConnected && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4">
              Connect your MetaMask wallet to start managing credentials
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}

        {/* Edit Asset Modal */}
        {editingAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Edit Asset: {editingAsset.id}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Asset ID"
                  value={editFormData.id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, id: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled // ID cannot be changed
                />
                <input
                  type="text"
                  placeholder="Owner"
                  value={editFormData.owner || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, owner: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={editFormData.department || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Academic Year"
                  value={editFormData.academicYear || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Program Start Date"
                  value={editFormData.startDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="When the academic program started"
                />
                <input
                  type="date"
                  placeholder="Program End Date"
                  value={editFormData.endDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="When the academic program ended"
                />
                <input
                  type="text"
                  placeholder="Certificate Type"
                  value={editFormData.certificateType || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, certificateType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={editFormData.status || 'draft'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                  <option value="verified">Verified</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              {/* Show current issue date if it exists */}
              {editingAsset.issueDate && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Issue Date:</strong> {editingAsset.issueDate}
                    <br />
                    <span className="text-xs text-green-600">This date was set when the certificate was issued and cannot be changed.</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setEditingAsset(null);
                    setEditFormData({});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editAsset}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Asset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assets List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Assets ({assets.length})
            </h2>
          </div>

          {loading && assets.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No assets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">ID</th>
                    <th className="text-left p-4 font-medium text-gray-900">Owner</th>
                    <th className="text-left p-4 font-medium text-gray-900">Department</th>
                    <th className="text-left p-4 font-medium text-gray-900">Type</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {asset.id}
                        </span>
                      </td>
                      <td className="p-4">{asset.owner}</td>
                      <td className="p-4">{asset.department}</td>
                      <td className="p-4">{asset.certificateType || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Edit Button - only show for draft status */}
                          {asset.status === 'draft' && (
                            <button
                              onClick={() => {

                                setEditingAsset(asset);
                                setEditFormData({
                                  id: asset.id,
                                  owner: asset.owner,
                                  department: asset.department,
                                  academicYear: asset.academicYear,
                                  startDate: asset.startDate,
                                  endDate: asset.endDate,
                                  certificateType: asset.certificateType,
                                  status: asset.status,
                                  txHash: asset.txHash,
                                });
                              }}
                              className="p-1 text-yellow-600 hover:text-yellow-800"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const newOwner = prompt('Enter new owner:', asset.owner);
                              if (newOwner && newOwner !== asset.owner) {
                                transferAsset(asset.id, newOwner);
                              }
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Transfer Asset"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(asset.id, asset.status === 'verified' ? 'issued' : 'verified')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Toggle Status"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
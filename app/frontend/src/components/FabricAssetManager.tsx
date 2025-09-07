"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit, Trash2, Send, Check, X, RefreshCw } from 'lucide-react';

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
    issueDate: '',
    status: 'draft',
    txHash: ''
  });

  // Fetch all assets
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/assets`);
      const result: ApiResponse<Asset[]> = await response.json();

      if (result.success) {
        console.log('🔍 Assets from blockchain:', result.data);
        console.log('🔍 Asset IDs:', result.data?.map(asset => asset.id));
        setAssets(result.data || []);
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
          issueDate: newAsset.issueDate,
          status: newAsset.status,
          txHash: newAsset.txHash,
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
          issueDate: '',
          status: 'draft',
          txHash: ''
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
      joinDate: editFormData.startDate,
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

  // Delete asset
  const deleteAsset = async (id: string) => {
    if (!confirm(`Are you sure you want to delete asset ${id}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        await fetchAssets();
      } else {
        setError(result.error || 'Failed to delete asset');
      }
    } catch (err) {
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Load assets on component mount
  useEffect(() => {
    fetchAssets();
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fabric Asset Manager</h1>
              <p className="text-gray-600 mt-2">Manage blockchain assets on Hyperledger Fabric</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAssets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Asset
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

        {/* Create Asset Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Asset</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Asset ID *"
                value={newAsset.id || ''}
                onChange={(e) => setNewAsset({ ...newAsset, id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Owner *"
                value={newAsset.owner || ''}
                onChange={(e) => setNewAsset({ ...newAsset, owner: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Department *"
                value={newAsset.department || ''}
                onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="Start Date"
                value={newAsset.startDate || ''}
                onChange={(e) => setNewAsset({ ...newAsset, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="End Date"
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
              <input
                type="date"
                placeholder="Issue Date"
                value={newAsset.issueDate || ''}
                onChange={(e) => setNewAsset({ ...newAsset, issueDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newAsset.status || 'draft'}
                onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="verified">Verified</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAsset}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Create Asset
              </button>
            </div>
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
                  placeholder="Start Date"
                  value={editFormData.startDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={editFormData.endDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Certificate Type"
                  value={editFormData.certificateType || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, certificateType: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Issue Date"
                  value={editFormData.issueDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
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
                                  issueDate: asset.issueDate,
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
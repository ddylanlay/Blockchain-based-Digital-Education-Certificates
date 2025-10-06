'use client';

import { useState, useEffect } from 'react';
import { mspApiService, Certificate } from '@/lib/mspApi';

export default function CAAdminDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    id: '',
    owner: '',
    department: '',
    academicYear: '2023-2024',
    joinDate: '',
    endDate: '',
    certificateType: '',
    issueDate: '',
    status: 'issued'
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const result = await mspApiService.getAllCertificates('CA_ADMIN');

      if (result.success && result.data) {
        setCertificates(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setError(result.error || 'Failed to load certificates');
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setError('Network error while loading certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const result = await mspApiService.createCertificate(newCertificate, 'CA_ADMIN');

      if (result.success) {
        setShowCreateForm(false);
        setNewCertificate({
          id: '',
          owner: '',
          department: '',
          academicYear: '2023-2024',
          joinDate: '',
          endDate: '',
          certificateType: '',
          issueDate: '',
          status: 'issued'
        });
        await loadCertificates(); // Reload certificates
      } else {
        setError(result.error || 'Failed to create certificate');
      }
    } catch (error) {
      console.error('Error creating certificate:', error);
      setError('Network error while creating certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await mspApiService.updateCertificateStatus(id, newStatus, 'CA_ADMIN');

      if (result.success) {
        await loadCertificates(); // Reload certificates
      } else {
        setError(result.error || 'Failed to update certificate status');
      }
    } catch (error) {
      console.error('Error updating certificate status:', error);
      setError('Network error while updating certificate status');
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      const result = await mspApiService.deleteCertificate(id, 'CA_ADMIN');

      if (result.success) {
        await loadCertificates(); // Reload certificates
      } else {
        setError(result.error || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setError('Network error while deleting certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CA Admin Dashboard</h1>
              <p className="text-gray-600">Manage certificates using MSP-based authentication</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Certificate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Certificate</h2>
            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate ID
                  </label>
                  <input
                    type="text"
                    value={newCertificate.id}
                    onChange={(e) => setNewCertificate({...newCertificate, id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner (Student Name)
                  </label>
                  <input
                    type="text"
                    value={newCertificate.owner}
                    onChange={(e) => setNewCertificate({...newCertificate, owner: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newCertificate.department}
                    onChange={(e) => setNewCertificate({...newCertificate, department: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate Type
                  </label>
                  <select
                    value={newCertificate.certificateType}
                    onChange={(e) => setNewCertificate({...newCertificate, certificateType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate of Completion">Certificate of Completion</option>
                    <option value="Transcript">Transcript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={newCertificate.academicYear}
                    onChange={(e) => setNewCertificate({...newCertificate, academicYear: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newCertificate.issueDate}
                    onChange={(e) => setNewCertificate({...newCertificate, issueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Certificate'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Certificates ({certificates.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No certificates found.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Create your first certificate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificates.map((cert) => (
                    <tr key={cert.ID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cert.ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.Owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.certificateType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cert.status === 'issued' ? 'bg-green-100 text-green-800' :
                          cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          cert.status === 'revoked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <select
                          value={cert.status}
                          onChange={(e) => handleUpdateStatus(cert.ID, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="issued">Issued</option>
                          <option value="pending">Pending</option>
                          <option value="revoked">Revoked</option>
                        </select>
                        <button
                          onClick={() => handleDeleteCertificate(cert.ID)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Delete
                        </button>
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

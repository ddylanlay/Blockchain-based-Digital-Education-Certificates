'use client';

import { useState, useEffect } from 'react';
import { mspApiService, Certificate } from '@/lib/mspApi';

export default function StudentDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    loadMyCertificates();
  }, []);

  const loadMyCertificates = async () => {
    try {
      setIsLoading(true);
      const result = await mspApiService.getStudentCertificates('STUDENT');

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

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    try {
      setIsLoading(true);
      const result = await mspApiService.verifyCertificate(verificationId);

      if (result.success) {
        setVerificationResult(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to verify certificate');
        setVerificationResult(null);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('Network error while verifying certificate');
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">View your certificates and verify others</p>
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

        {/* Certificate Verification Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Verify Certificate</h2>
          <form onSubmit={handleVerifyCertificate} className="flex gap-4">
            <input
              type="text"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {verificationResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Verification Result</h3>
              {verificationResult.isValid ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="text-green-600 text-lg font-semibold">
                      ✅ Certificate Verified
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Certificate ID:</strong> {verificationResult.certificateId}</p>
                    <p><strong>Owner:</strong> {verificationResult.certificate?.Owner}</p>
                    <p><strong>Department:</strong> {verificationResult.certificate?.department}</p>
                    <p><strong>Type:</strong> {verificationResult.certificate?.certificateType}</p>
                    <p><strong>Status:</strong> {verificationResult.certificate?.status}</p>
                    <p><strong>Verified At:</strong> {new Date(verificationResult.verifiedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 font-semibold">
                    ❌ Certificate Not Found
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {verificationResult.message || 'The certificate ID does not exist in the system.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Certificates Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">My Certificates ({certificates.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>You don't have any certificates yet.</p>
              <p className="text-sm mt-1">Contact your university administrator to issue certificates.</p>
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
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
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
                        {cert.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.certificateType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.academicYear}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">About Your Certificates</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Your certificates are stored securely on the blockchain</p>
            <p>• Only you can view your own certificates</p>
            <p>• You can verify any certificate using its ID</p>
            <p>• Certificates are tamper-proof and immutable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

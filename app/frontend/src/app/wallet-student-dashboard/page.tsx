'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Certificate {
  ID: string;
  Owner: string;
  department: string;
  academicYear: string;
  joinDate: string;
  endDate: string;
  certificateType: string;
  issueDate: string;
  status: string;
  txHash: string;
  hash?: string;
  studentWallet?: string;
}

export default function WalletStudentDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadMyCertificates();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const walletConnected = localStorage.getItem('walletConnected');

      if (!walletAddress || walletConnected !== 'true') {
        router.push('/login');
        return;
      }

      // Create a simple user object for students
      setUser({
        walletAddress,
        name: walletAddress === '0x31078896C920EA1d5aADdar8270D44F6e46AF1a426' ? 'John Smith' : 'Student',
        email: walletAddress === '0x31078896C920EA1d5aADdar8270D44F6e46AF1a426' ? 'john.smith@email.com' : 'student@email.com'
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadMyCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call our wallet-based backend endpoint
      const response = await fetch('http://localhost:3002/api/student/certificates',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'STUDENT' })
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Filter certificates for this specific student wallet
        const walletAddress = user?.walletAddress;

        // Filter certificates for this specific student wallet
        const studentCertificates = result.data.filter((cert: Certificate) => {
          console.log('Checking certificate:', cert);

          // Method 1: Check if studentWallet field matches
          if (cert.studentWallet && walletAddress) {
            const matches = cert.studentWallet.toLowerCase() === walletAddress.toLowerCase();
            console.log(`Checking studentWallet: ${cert.studentWallet} === ${walletAddress} ? ${matches}`);
            return matches;
          }

          // Method 2: Check if Owner field matches (legacy)
          if (cert.Owner && walletAddress) {
            const matches = cert.Owner.toLowerCase() === walletAddress.toLowerCase();
            console.log(`Checking Owner: ${cert.Owner} === ${walletAddress} ? ${matches}`);
            return matches;
          }

          // Method 3: Check if certificateType contains student wallet (our new method)
          if (cert.certificateType && walletAddress) {
            const matches = cert.certificateType.toLowerCase() === walletAddress.toLowerCase();
            console.log(`Checking certificateType: ${cert.certificateType} === ${walletAddress} ? ${matches}`);
            return matches;
          }

          console.log('No matching fields found for certificate');
          return false;
        });

        console.log(`Found ${studentCertificates.length} certificates for wallet ${walletAddress}`);
        console.log('All certificates:', result.data);
        setCertificates(studentCertificates);
      } else {
        setError(result.error || 'Failed to load certificates');
        console.log('Error from backend:', result);
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

      const response = await fetch('http://localhost:3002/api/verify-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: verificationId })
      });

      const result = await response.json();

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

  const handleLogout = () => {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">View your certificates and verify others</p>
              <p className="text-sm text-gray-500 mt-1">Logged in as: {user.name} ({user.walletAddress})</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-semibold">Error</span>
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* My Certificates Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Certificates ({certificates.length})</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading certificates...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No certificates found. Contact your university administrator.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hash
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {cert.hash ? cert.hash.substring(0, 16) + '...' : cert.academicYear ? cert.academicYear.substring(0, 16) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Certificate Verification Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Verify Certificate</h2>

          <form onSubmit={handleVerifyCertificate} className="space-y-4">
            <div>
              <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <input
                type="text"
                id="verificationId"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter certificate ID to verify"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
              Verify Certificate
            </button>
          </form>

          {verificationResult && (
            <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Verification Result</h3>
              <pre className="text-green-700 text-sm overflow-x-auto">
                {JSON.stringify(verificationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

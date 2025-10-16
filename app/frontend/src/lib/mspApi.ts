// MSP-based API service for frontend
// This replaces the wallet-based authentication with MSP-based authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface MSPUser {
  mspId: string;
  userId: string;
  role: 'CA_ADMIN' | 'STUDENT';
  name: string;
  email: string;
}

export interface Certificate {
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
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: MSPUser;
  error?: string;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  data?: Certificate | Certificate[];
  count?: number;
  error?: string;
}

class MSPApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate user using MSP identity
   */
  async authenticateUser(role: 'CA_ADMIN' | 'STUDENT'): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/msp-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('MSP authentication error:', error);
      return {
        success: false,
        error: 'Network error during authentication'
      };
    }
  }

  /**
   * Get seed CA admin info
   */
  async getSeedCAAdminInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/seed-ca-admin`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting seed CA admin info:', error);
      throw error;
    }
  }

  /**
   * Get seed student info
   */
  async getSeedStudentInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/seed-student`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting seed student info:', error);
      throw error;
    }
  }

  /**
   * Create certificate (CA Admin only)
   */
  async createCertificate(certificateData: Partial<Certificate>, role: 'CA_ADMIN'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...certificateData,
          role
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      return {
        success: false,
        error: 'Network error during certificate creation'
      };
    }
  }

  /**
   * Update certificate status (CA Admin only)
   */
  async updateCertificateStatus(id: string, status: string, role: 'CA_ADMIN'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certificates/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          role
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating certificate status:', error);
      return {
        success: false,
        error: 'Network error during status update'
      };
    }
  }

  /**
   * Delete certificate (CA Admin only)
   */
  async deleteCertificate(id: string, role: 'CA_ADMIN'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certificates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      return {
        success: false,
        error: 'Network error during certificate deletion'
      };
    }
  }

  /**
   * Get all certificates (CA Admin only)
   */
  async getAllCertificates(role: 'CA_ADMIN'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting all certificates:', error);
      return {
        success: false,
        error: 'Network error during certificate retrieval'
      };
    }
  }

  /**
   * Get student's certificates (Student only)
   */
  async getStudentCertificates(role: 'STUDENT'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/student/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting student certificates:', error);
      return {
        success: false,
        error: 'Network error during certificate retrieval'
      };
    }
  }

  /**
   * Get specific certificate
   */
  async getCertificate(id: string, role: 'CA_ADMIN' | 'STUDENT'): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certificates/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting certificate:', error);
      return {
        success: false,
        error: 'Network error during certificate retrieval'
      };
    }
  }

  /**
   * Verify certificate (public endpoint)
   */
  async verifyCertificate(id: string): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        success: false,
        error: 'Network error during certificate verification'
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mspApiService = new MSPApiService();
export default mspApiService;

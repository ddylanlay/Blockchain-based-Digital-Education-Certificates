import {
    Certificate,
    CreateCertificateRequest,
    UpdateCertificateRequest,
    UpdateStatusRequest,
    ApiResponse,
    CertificateExistsResponse
  } from './types';

  // Base API URL - adjust if your backend runs on a different port
const API_BASE_URL = 'http://localhost:3001/api';

// Custom error class for API errors
export class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = 'ApiError';
    }
  }


// Generic API request function
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


// Certificate API functions
export const certificateApi = {
    // Get all certificates
    async getAllCertificates(): Promise<Certificate[]> {
      const response = await apiRequest<{ success: boolean; data: Certificate[] }>('/assets');
      return response.data || [];
    },

    // Get a single certificate by ID
    async getCertificate(id: string): Promise<Certificate> {
      const response = await apiRequest<{ success: boolean; data: Certificate }>(`/assets/${id}`);
      return response.data;
    },

    // Create a new certificate
    async createCertificate(certificate: CreateCertificateRequest): Promise<Certificate> {
      const response = await apiRequest<{ success: boolean; data: Certificate }>('/assets', {
        method: 'POST',
        body: JSON.stringify(certificate),
      });
      return response.data;
    },

    // Update an existing certificate
    async updateCertificate(id: string, certificate: UpdateCertificateRequest): Promise<Certificate> {
      const response = await apiRequest<{ success: boolean; data: Certificate }>(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(certificate),
      });
      return response.data;
    },

    // Delete a certificate
    async deleteCertificate(id: string): Promise<void> {
      await apiRequest(`/assets/${id}`, {
        method: 'DELETE',
      });
    },

    // Transfer a certificate
    async transferCertificate(id: string, transferData: { newOwner: string }): Promise<Certificate> {
      const response = await apiRequest<{ success: boolean; data: Certificate }>(`/assets/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify(transferData),
      });
      return response.data;
    },

    // Update certificate status
    async updateCertificateStatus(id: string, statusData: UpdateStatusRequest): Promise<Certificate> {
      const response = await apiRequest<{ success: boolean; data: Certificate }>(`/assets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      });
      return response.data;
    },

    // Check if certificate exists
    async certificateExists(id: string): Promise<CertificateExistsResponse> {
      const response = await apiRequest<{ success: boolean; exists: boolean }>(`/assets/${id}/exists`);
      return { exists: response.exists };
    },

    // Get certificates by owner
    async getCertificatesByOwner(owner: string): Promise<Certificate[]> {
      const response = await apiRequest<{ success: boolean; data: Certificate[] }>(`/assets/owner/${owner}`);
      return response.data || [];
    },

    // Get certificates by status
    async getCertificatesByStatus(status: string): Promise<Certificate[]> {
      const response = await apiRequest<{ success: boolean; data: Certificate[] }>(`/assets/status/${status}`);
      return response.data || [];
    }
  };
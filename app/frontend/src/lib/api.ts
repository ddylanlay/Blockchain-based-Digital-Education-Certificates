import { Asset, ApiResponse } from './types';

// Base URL for the API - updated for in-wallet approach
const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();

      // Handle different response formats
      if (data.success !== undefined) {
        return data;
      } else {
        // For direct data responses
        return {
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Get all assets (blockchain data for display)
  async getAllAssets(): Promise<ApiResponse<Asset[]>> {
    return this.request<Asset[]>('/assets');
  }

  // Create new credential (in-wallet approach)
  async createCredential(credential: any, hash: string, signature: string, walletAddress: string): Promise<ApiResponse> {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify({
        ...credential,
        hash,
        signature,
        walletAddress,
      }),
    });
  }

  // Verify credential
  async verifyCredential(id: string, hash: string, signature: string): Promise<ApiResponse> {
    return this.request('/verify-credential', {
      method: 'POST',
      body: JSON.stringify({
        id,
        hash,
        signature,
      }),
    });
  }
}

// Export a default instance
export const apiService = new ApiService();

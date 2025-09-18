import { Asset, ApiResponse } from './types';

// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  // Get all assets
  async getAllAssets(): Promise<ApiResponse<Asset[]>> {
    return this.request<Asset[]>('/api/assets');
  }

  // Get asset by ID
  async getAssetById(id: string): Promise<ApiResponse<Asset>> {
    return this.request<Asset>(`/api/assets/${id}`);
  }

  // Create new asset
  async createAsset(asset: Omit<Asset, 'txHash'>): Promise<ApiResponse> {
    return this.request('/api/assets', {
      method: 'POST',
      body: JSON.stringify({
        signature: '0x123', // Demo signature
        message: 'Demo authentication',
        walletAddress: '0xDemo',
        ...asset,
      }),
    });
  }

  // Update asset
  async updateAsset(id: string, asset: Partial<Asset>): Promise<ApiResponse> {
    return this.request(`/api/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        signature: '0x123', // Demo signature
        message: 'Demo authentication',
        walletAddress: '0xDemo',
        ...asset,
      }),
    });
  }

  // Update asset status only
  async updateAssetStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/api/assets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        signature: '0x123', // Demo signature
        message: 'Demo authentication',
        walletAddress: '0xDemo',
        status,
      }),
    });
  }

  // Transfer asset ownership
  async transferAsset(id: string, newOwner: string): Promise<ApiResponse> {
    return this.request(`/api/assets/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        signature: '0x123', // Demo signature
        message: 'Demo authentication',
        walletAddress: '0xDemo',
        newOwner,
      }),
    });
  }

  // Delete asset
  async deleteAsset(id: string): Promise<ApiResponse> {
    return this.request(`/api/assets/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        signature: '0x123', // Demo signature
        message: 'Demo authentication',
        walletAddress: '0xDemo',
      }),
    });
  }
}

// Export a default instance
export const apiService = new ApiService();
// Asset interface matching the blockchain chaincode
export interface Asset {
  id: string;
  owner: string;
  department: string;
  academicYear: string;
  joinDate: string;
  endDate: string;
  certificateType: string;
  issueDate: string;
  status: string;
  txHash: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Certificate status types
export type CertificateStatus = 'draft' | 'pending' | 'issued' | 'revoked' | 'expired';

// User types for demo
export interface DemoUser {
  id: string;
  name: string;
  department?: string;
  role?: string;
}
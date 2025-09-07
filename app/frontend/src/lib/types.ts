//Interfaces for all certificate operations -> proper type safety for API requests and responses

export interface Certificate {
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

export interface CreateCertificateRequest {
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

export interface UpdateCertificateRequest {
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

export interface UpdateStatusRequest {
  newStatus: string;
}


// Defines what the frontend will receive in each API response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CertificateExistsResponse {
  exists: boolean;
}
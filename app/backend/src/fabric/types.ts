export interface Asset {
  ID: string;
  Owner: string;
  department: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  certificateType: string;
  issueDate: string;
  status: string;
  txHash: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  role: 'admin' | 'issuer' | 'verifier' | 'student';
  university?: string;
  isActive: boolean;
  createdAt: string;
}

export interface VerifierAccount {
  walletAddress: string;
  name: string;
  email: string;
  university: string;
  role: 'verifier';
  isActive: boolean;
  createdAt: string;
}
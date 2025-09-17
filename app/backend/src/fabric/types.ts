export interface Asset {
  id: string;
  owner: string;
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
  role: 'admin' | 'issuer' | 'verifier' | 'student';
}
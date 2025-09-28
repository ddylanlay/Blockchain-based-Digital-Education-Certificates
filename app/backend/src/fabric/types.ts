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
  role: 'admin' | 'issuer' | 'verifier' | 'student';
}
# Education Credential Verification API Documentation

This API provides endpoints for managing educational credentials on a Hyperledger Fabric blockchain network. The system allows creating, reading, updating, and deleting credential assets while maintaining immutable records of all transactions.

## Base URLs
- **Wallet-based Authentication**: `http://localhost:3000` (Port 3000)
- **MSP-based Authentication**: `http://localhost:3002` (Port 3002)

## Authentication

The system supports **two distinct authentication mechanisms**:

### 1. Wallet-Based Authentication (Port 3000)
Uses Ethereum wallet signatures for authentication. Protected endpoints require the following in the request body:

```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  // ... other endpoint-specific data
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "signature": "0x1234567890abcdef...",
    "message": "Sign this message to authenticate",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

### 2. MSP-Based Authentication (Port 3002)
Uses Hyperledger Fabric MSP (Membership Service Provider) certificates for authentication. This provides role-based access control with built-in blockchain-level security.

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/msp/login \
  -H "Content-Type: application/json" \
  -H "X-MSP-ID": "UniversityCAMSP" \
  -d '{
    "username": "admin",
    "password": "adminpw"
  }'
```

**Headers Required:**
- `X-MSP-ID`: The MSP organization identifier (e.g., `UniversityCAMSP`, `StudentMSP`)

### Authentication Mechanism Mapping

| Endpoint Category | Wallet Auth (Port 3000) | MSP Auth (Port 3002) |
|-------------------|-------------------------|----------------------|
| Health Check | ✅ `/health` | ✅ `/health` |
| User Authentication | ✅ `/api/auth/*` | ✅ `/api/msp/*` |
| Asset Management | ✅ `/api/assets/*` | ✅ `/api/msp/assets/*` |
| Student Certificates | ✅ `/api/student/*` | ✅ `/api/msp/student/*` |
| Certificate Verification | ✅ `/api/verify-*` | ✅ `/api/msp/verify-*` |

> **📋 For detailed MSP authentication guidance**, see [MSP_RBAC_IMPLEMENTATION.md](../MSP_RBAC_IMPLEMENTATION.md)

## Health Check

### GET /health
Check if the API server is running.

**Available on both servers:**
- Wallet Auth Server: `GET http://localhost:3000/health`
- MSP Auth Server: `GET http://localhost:3002/health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

---

## Assets Endpoints (Wallet Authentication Server - Port 3000)

All asset endpoints are prefixed with `/api/assets` and use wallet-based authentication.

### GET /api/assets
Get all credential assets from the blockchain.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "credential-001",
      "owner": "john.doe@university.edu",
      "department": "Computer Science",
      "academicYear": "2024",
      "startDate": "2024-01-15",
      "endDate": "2024-12-15",
      "certificateType": "Bachelor of Science",
      "issueDate": "2024-12-20",
      "status": "issued",
      "txHash": "0xabc123..."
    }
  ],
  "count": 1
}
```

### GET /api/assets/:id
Get a specific credential asset by ID.

**Parameters:**
- `id` (string): The unique identifier of the credential

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "credential-001",
    "owner": "john.doe@university.edu",
    "department": "Computer Science",
    "academicYear": "2024",
    "startDate": "2024-01-15",
    "endDate": "2024-12-15",
    "certificateType": "Bachelor of Science",
    "issueDate": "2024-12-20",
    "status": "issued",
    "txHash": "0xabc123..."
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Asset not found"
}
```

### POST /api/assets
Create a new credential asset.

**Authentication:** Required (wallet signature)

**Request Body:**
```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  "id": "credential-002",
  "owner": "jane.smith@university.edu",
  "department": "Mathematics",
  "academicYear": "2024",
  "startDate": "2024-01-15",
  "endDate": "2024-12-15",
  "certificateType": "Master of Science"
}
```

**Required Fields:**
- `id`: Unique identifier for the credential
- `owner`: Email or identifier of the credential owner
- `department`: Academic department

**Response:**
```json
{
  "success": true,
  "message": "Asset created",
  "id": "credential-002"
}
```

**Error Responses:**
```json
// Missing required fields (400)
{
  "success": false,
  "error": "Missing required fields"
}

// Asset already exists (409)
{
  "success": false,
  "error": "Asset already exists"
}

// Authentication failed (401)
{
  "success": false,
  "error": "Wallet signature, message, and address required"
}
```

### PUT /api/assets/:id
Update an existing credential asset.

**Parameters:**
- `id` (string): The unique identifier of the credential

**Authentication:** Required (wallet signature)

**Request Body:**
```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  "owner": "jane.smith@university.edu",
  "department": "Mathematics",
  "academicYear": "2024",
  "startDate": "2024-01-15",
  "endDate": "2024-12-15",
  "certificateType": "Master of Science",
  "issueDate": "2024-12-20",
  "status": "issued",
  "txHash": "0xdef456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset updated",
  "id": "credential-002"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Asset not found"
}
```

### PATCH /api/assets/:id/status
Update only the status of a credential asset.

**Parameters:**
- `id` (string): The unique identifier of the credential

**Authentication:** Required (wallet signature)

**Request Body:**
```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  "status": "issued"
}
```

**Valid Status Values:**
- `draft`: Initial state when credential is created
- `pending`: Under review/processing
- `issued`: Officially issued and verified
- `revoked`: Credential has been revoked
- `expired`: Credential has expired

**Response:**
```json
{
  "success": true,
  "message": "Asset status updated",
  "id": "credential-002",
  "status": "issued"
}
```

### POST /api/assets/:id/transfer
Transfer ownership of a credential asset to a new owner.

**Parameters:**
- `id` (string): The unique identifier of the credential

**Authentication:** Required (wallet signature)

**Request Body:**
```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  "newOwner": "newowner@university.edu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset transferred",
  "id": "credential-002",
  "newOwner": "newowner@university.edu"
}
```

### DELETE /api/assets/:id
Delete a credential asset from the blockchain.

**Parameters:**
- `id` (string): The unique identifier of the credential

**Authentication:** Required (wallet signature)

**Request Body:**
```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted",
  "id": "credential-002"
}
```

---

## Data Models

### Asset
```typescript
interface Asset {
  id: string;              // Unique identifier
  owner: string;           // Owner email/identifier
  department: string;      // Academic department
  academicYear: string;    // Academic year
  startDate: string;       // Course/program start date (YYYY-MM-DD)
  endDate: string;         // Course/program end date (YYYY-MM-DD)
  certificateType: string; // Type of certificate/degree
  issueDate: string;       // Date when certificate was issued (YYYY-MM-DD)
  status: string;          // Current status (draft/pending/issued/revoked/expired)
  txHash: string;          // Blockchain transaction hash
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'issuer' | 'verifier' | 'student';
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

---

## MSP Authentication Endpoints (MSP Authentication Server - Port 3002)

These endpoints use Hyperledger Fabric MSP certificates for authentication and provide role-based access control.

### POST /api/auth/msp-login
Authenticate using MSP credentials.

**Authentication:** MSP certificate required

**Headers:**
```
X-MSP-ID: UniversityCAMSP
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "adminpw"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MSP authentication successful",
  "user": {
    "username": "admin",
    "role": "CA_ADMIN",
    "mspId": "UniversityCAMSP"
  }
}
```

### GET /api/auth/seed-ca-admin
Get seed CA admin credentials for testing.

**Authentication:** Not required

**Response:**
```json
{
  "username": "admin",
  "password": "adminpw",
  "mspId": "UniversityCAMSP"
}
```

### GET /api/auth/seed-student
Get seed student credentials for testing.

**Authentication:** Not required

**Response:**
```json
{
  "username": "student1",
  "password": "studentpw",
  "mspId": "StudentMSP"
}
```

### POST /api/certificates
Create a new certificate (CA Admin only).

**Authentication:** MSP authentication required
**Authorization:** CA_ADMIN role required

**Headers:**
```
X-MSP-ID: UniversityCAMSP
```

**Request Body:**
```json
{
  "studentId": "32529279",
  "studentName": "John Smith",
  "department": "Computer Science",
  "academicYear": "2024",
  "certificateType": "Bachelor of Science",
  "issueDate": "2024-12-20"
}
```

### GET /api/certificates
Get all certificates (CA Admin only).

**Authentication:** MSP authentication required
**Authorization:** CA_ADMIN role required

**Headers:**
```
X-MSP-ID: UniversityCAMSP
```

### GET /api/student/certificates
Get certificates for the authenticated student.

**Authentication:** MSP authentication required
**Authorization:** STUDENT role required

**Headers:**
```
X-MSP-ID: StudentMSP
```

### GET /api/certificates/:id
Get a specific certificate by ID.

**Authentication:** MSP authentication required
**Authorization:** CA_ADMIN or STUDENT role required

**Headers:**
```
X-MSP-ID: UniversityCAMSP (or StudentMSP)
```

### PUT /api/certificates/:id/status
Update certificate status (CA Admin only).

**Authentication:** MSP authentication required
**Authorization:** CA_ADMIN role required

**Headers:**
```
X-MSP-ID: UniversityCAMSP
```

**Request Body:**
```json
{
  "status": "revoked",
  "reason": "Academic misconduct"
}
```

### DELETE /api/certificates/:id
Delete a certificate (CA Admin only).

**Authentication:** MSP authentication required
**Authorization:** CA_ADMIN role required

**Headers:**
```
X-MSP-ID: UniversityCAMSP
```

### POST /api/verify-certificate
Verify a certificate (public endpoint).

**Authentication:** Not required

**Request Body:**
```json
{
  "certificateId": "CERT-123",
  "studentId": "32529279"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing required fields, invalid data)
- `401`: Unauthorized (invalid wallet signature or MSP certificate)
- `403`: Forbidden (insufficient role permissions)
- `404`: Not Found (asset doesn't exist)
- `409`: Conflict (asset already exists)
- `500`: Internal Server Error

**MSP-Specific Error Codes:**
- `401`: Invalid MSP certificate or credentials
- `403`: Role-based access denied (e.g., STUDENT trying to access CA_ADMIN endpoint)

---

## Blockchain Integration

Both authentication servers interface with the same Hyperledger Fabric blockchain network:

- **Network:** mychannel
- **Chaincode:** basic
- **MSP ID:** Org1MSP

### Server Architecture

- **Wallet Auth Server (Port 3000)**: Uses Ethereum wallet signatures for **decentralized authentication**
- **MSP Auth Server (Port 3002)**: Uses Fabric MSP certificates for **centralized role-based authentication**

Both servers access the same blockchain data but provide fundamentally different authentication approaches:

#### Decentralization Comparison

| Aspect | Wallet Auth (Port 3000) | MSP Auth (Port 3002) |
|--------|-------------------------|----------------------|
| **Control** | User controls private key | University controls certificates |
| **Authority** | No central authority | University CA is central authority |
| **Access** | Permissionless | Permissioned (university approval required) |
| **Identity** | Self-sovereign (wallet address) | Institution-managed (username/password) |
| **Registration** | Not required | Must be registered with university |
| **Revocation** | User controls | University can revoke access |
- **Peer:** peer0.org1.example.com:7051

All asset operations are recorded immutably on the blockchain, providing:
- Tamper-proof credential records
- Complete audit trail
- Decentralized verification
- Cryptographic proof of authenticity

---

## Quick Start Guide

### Choosing Your Authentication Method

**Use Wallet Authentication (Port 3000) when:**
- Building web3 applications
- Users have Ethereum wallets (MetaMask, etc.)
- You want **truly decentralized authentication** (no central authority)
- Students need to connect their own wallets
- You want **permissionless access** (no university registration required)
- Users control their own identity and private keys

**Use MSP Authentication (Port 3002) when:**
- Building traditional web applications
- You need **centralized role-based access control**
- University administrators need **institutional control** over access
- You want Fabric's built-in security features
- You need **permissioned access** (university controls who gets certificates)
- You want **traditional username/password** authentication

### Getting Started

1. **Start the servers:**
   ```bash
   # Wallet authentication server
   cd app/backend && npm run dev

   # MSP authentication server (in another terminal)
   cd app/backend && npm run dev:msp
   ```

2. **Test connectivity:**
   ```bash
   curl http://localhost:3000/health  # Wallet server
   curl http://localhost:3002/health  # MSP server
   ```

3. **Choose your authentication flow** based on the examples above.

---

## Example Workflows

### Creating a New Credential
1. POST `/api/assets` with credential details
2. Asset is created with `draft` status
3. Use PATCH `/api/assets/:id/status` to update to `issued` when ready

### Verifying a Credential
1. GET `/api/assets/:id` to retrieve credential details
2. Verify the blockchain transaction hash
3. Check status and issuing authority

### Transferring Ownership
1. POST `/api/assets/:id/transfer` with new owner details
2. Ownership is transferred on the blockchain
3. Old owner loses access, new owner gains control

---

## Development Setup

1. Start the Hyperledger Fabric test network
2. Deploy the basic chaincode
3. Start the API server:
   ```bash
   cd app/backend
   bun run dev
   ```

The API will be available at `http://localhost:3000`.

# Education Credential Verification API Documentation

This API provides endpoints for managing educational credentials on a Hyperledger Fabric blockchain network. The system allows creating, reading, updating, and deleting credential assets while maintaining immutable records of all transactions.

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require wallet-based authentication using Ethereum signatures. Protected endpoints require the following in the request body:

```json
{
  "signature": "0x...",
  "message": "Authentication message",
  "walletAddress": "0x...",
  // ... other endpoint-specific data
}
```

## Health Check

### GET /health
Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

---

## Assets Endpoints

All asset endpoints are prefixed with `/api/assets`.

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

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing required fields, invalid data)
- `401`: Unauthorized (invalid wallet signature)
- `404`: Not Found (asset doesn't exist)
- `409`: Conflict (asset already exists)
- `500`: Internal Server Error

---

## Blockchain Integration

This API interfaces with a Hyperledger Fabric blockchain network:

- **Network:** mychannel
- **Chaincode:** basic
- **MSP ID:** Org1MSP
- **Peer:** peer0.org1.example.com:7051

All asset operations are recorded immutably on the blockchain, providing:
- Tamper-proof credential records
- Complete audit trail
- Decentralized verification
- Cryptographic proof of authenticity

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

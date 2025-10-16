# Backend API Server

This directory contains the backend API server for the Education Credential Verification system with in-wallet approach.

## Structure

```
backend/
├── src/
│   ├── fabric.ts             # Hyperledger Fabric connection and blockchain operations
│   └── server.ts             # Express.js API server with wallet integration
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Usage

### Start the Backend Server

```bash
# From the backend directory
npm run dev
# or
npm start
```

The server will start on `http://localhost:3001` and provide the following API endpoints:

- `GET /api/assets` - Get all assets from the blockchain
- `POST /api/assets` - Create a new credential (in-wallet approach)
- `POST /api/verify-credential` - Verify credential hash and signature
- `GET /health` - Health check endpoint

## Prerequisites

1. Make sure you have the fabric-samples directory at the same level as the Education-Credential-Verification directory
2. Ensure the Hyperledger Fabric test network is running (use `smart-fabric.sh start`)
3. The basic chaincode should be deployed on the network

## In-Wallet Approach

- **Credentials stored in user's wallet** (localStorage simulation)
- **Only credential hashes stored on blockchain** for verification
- **Wallet signature verification** for authentication
- **Better performance** and user privacy

## Notes

- The backend uses in-wallet approach with blockchain verification
- Full credential data is stored in user's wallet, only hashes on blockchain
- The server automatically initializes the Fabric connection on startup
- Network management is handled by `smart-fabric.sh` in the parent directory

## Troubleshooting

1. **Fabric Connection Issues:** Ensure the test network is running and the chaincode is deployed
2. **Port Conflicts:** Make sure port 3001 is available
3. **Crypto Material:** Verify that the fabric-samples directory contains the required certificates

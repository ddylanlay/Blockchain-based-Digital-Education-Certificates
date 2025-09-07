# Backend API Server

This directory contains the backend API server for the Education Credential Verification system.

## Structure

```
backend/
├── src/
│   ├── fabric.ts             # Hyperledger Fabric connection and blockchain operations
│   └── server.ts             # Express.js API server
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Usage

### Start the Backend Server

```bash
# From the backend directory
npm run dev
```

The server will start on `http://localhost:3001` and provide the following API endpoints:

- `GET /api/assets` - Get all assets from the blockchain
- `GET /api/assets/:id` - Get a specific asset
- `POST /api/assets` - Create a new asset
- `PUT /api/assets/:id` - Update an existing asset
- `PATCH /api/assets/:id/status` - Update asset status only
- `POST /api/assets/:id/transfer` - Transfer asset ownership
- `DELETE /api/assets/:id` - Delete an asset
- `GET /api/assets/:id/exists` - Check if asset exists
- `GET /health` - Health check endpoint

## Prerequisites

1. Make sure you have the fabric-samples directory at the same level as the Education-Credential-Verification directory
2. Ensure the Hyperledger Fabric test network is running (use `smart-fabric.sh start`)
3. The basic chaincode should be deployed on the network

## Notes

- The backend uses direct crypto material approach (no wallet required)
- All data operations are performed directly on the Hyperledger Fabric blockchain
- The server automatically initializes the Fabric connection on startup
- Network management is handled by `smart-fabric.sh` in the parent directory

## Troubleshooting

1. **Fabric Connection Issues:** Ensure the test network is running and the chaincode is deployed
2. **Port Conflicts:** Make sure port 3001 is available
3. **Crypto Material:** Verify that the fabric-samples directory contains the required certificates
# Backend Network Deployment

This directory contains the adapted network deployment scripts moved from the fabric-samples/test-network directory.

## Structure

```
backend/
├── network.sh                 # Main network deployment script
├── scripts/
│   ├── utils.sh              # Utility functions for logging and error handling
│   ├── envVar.sh             # Environment variables setup
│   ├── ccutils.sh            # Chaincode utility functions
│   ├── deployCC.sh           # Chaincode deployment script
│   └── packageCC.sh          # Chaincode packaging script
├── src/                      # Backend source code
└── README.md                 # This file
```

## Usage

### Deploy Chaincode

To deploy the basic chaincode (TypeScript) from the asset-transfer-basic example:

```bash
# From the backend directory
./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-typescript -ccl typescript
```

### Available Commands

- `deployCC` - Deploy a chaincode to a channel
- `up` - Bring up the orderer and peer nodes
- `down` - Bring down the network
- `createChannel` - Create and join a channel

### Examples

1. **Deploy TypeScript Chaincode:**
   ```bash
   ./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-typescript -ccl typescript
   ```

2. **Deploy JavaScript Chaincode:**
   ```bash
   ./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-javascript -ccl javascript
   ```

3. **Deploy Go Chaincode:**
   ```bash
   ./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-go -ccl go
   ```

## Prerequisites

1. Make sure you have the fabric-samples directory at the same level as the Education-Credential-Verification directory
2. Ensure the fabric binaries are installed and in your PATH
3. Docker should be running
4. The test network should be up and running

## Notes

- The scripts have been adapted to work from the backend directory
- Paths have been updated to reference the fabric-samples directory correctly
- The scripts assume the test network is already running
- Make sure to run the scripts from the backend directory

## Troubleshooting

1. **Permission Denied:** Make sure the scripts are executable (on Unix-like systems)
2. **Path Issues:** Ensure the fabric-samples directory is in the correct location
3. **Network Not Running:** Start the test network first using the original network.sh script in fabric-samples/test-network
#!/usr/bin/env bash

# Simple script to deploy the basic chaincode from the backend directory

echo "Deploying basic chaincode (TypeScript)..."

# Check if we're in the right directory
if [ ! -f "network.sh" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Check if fabric-samples directory exists
if [ ! -d "../../fabric-samples" ]; then
    echo "Error: fabric-samples directory not found. Please ensure it's at the same level as Education-Credential-Verification"
    exit 1
fi

# Check if the chaincode directory exists
if [ ! -d "../../fabric-samples/asset-transfer-basic/chaincode-typescript" ]; then
    echo "Error: asset-transfer-basic/chaincode-typescript directory not found"
    echo "Please ensure you have the fabric-samples directory with the asset-transfer-basic example"
    exit 1
fi

echo "Starting chaincode deployment..."
echo "Command: ./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-typescript -ccl typescript"

# Execute the deployment
./network.sh deployCC -ccn basic -ccp ../../fabric-samples/asset-transfer-basic/chaincode-typescript -ccl typescript

echo "Deployment completed!"
#!/bin/bash

# MSP-based RBAC Network Setup Script
# This script creates a Fabric network with proper MSP organizations for role-based access control

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "network.sh" ]; then
    print_error "Please run this script from the test-network directory"
    exit 1
fi

print_status "Setting up MSP-based RBAC network..."

# Step 1: Clean up any existing network
print_status "Cleaning up existing network..."
./network.sh down

# Step 2: Create crypto material for MSP organizations
print_status "Creating crypto material for MSP organizations..."

# Create University CA organization
print_status "Creating University CA organization..."
cryptogen generate --config=./organizations/cryptogen/crypto-config-university-ca.yaml --output="organizations"

# Create Student organization
print_status "Creating Student organization..."
cryptogen generate --config=./organizations/cryptogen/crypto-config-student.yaml --output="organizations"

# Step 3: Generate system channel genesis block
print_status "Generating system channel genesis block..."
configtxgen -profile MSPRBACNetwork -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# Step 4: Start the network
print_status "Starting the network..."
./network.sh up createChannel -c msp-rbac-channel -ca

# Step 5: Deploy chaincode with RBAC
print_status "Deploying RBAC-enabled chaincode..."
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript -c msp-rbac-channel

print_success "MSP-based RBAC network setup complete!"
print_status "Network details:"
print_status "- Channel: msp-rbac-channel"
print_status "- Chaincode: basic"
print_status "- Organizations: UniversityCA, StudentOrg"
print_status "- CA Admin User: Admin@university-ca.example.com"
print_status "- Student User: User1@student.example.com"

print_warning "Remember to:"
print_warning "1. Update your backend configuration to use MSP identities"
print_warning "2. Update frontend to work with MSP-based authentication"
print_warning "3. Test the role-based access control"

#!/bin/bash

# Seed CA Admin Account Setup Script
# This script creates a seed CA admin account with proper MSP identity for university administrators

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

print_status "Setting up seed CA admin account with MSP identity..."

# Check if we're in the right directory
if [ ! -f "setup-msp-rbac.sh" ]; then
    print_error "Please run this script from the test-network directory"
    exit 1
fi

# Step 1: Create the MSP-based network
print_status "Creating MSP-based network..."
./setup-msp-rbac.sh

# Step 2: Verify CA admin identity exists
CA_ADMIN_CERT_PATH="./organizations/peerOrganizations/university-ca.example.com/users/Admin@university-ca.example.com/msp/signcerts/Admin@university-ca.example.com-cert.pem"
CA_ADMIN_KEY_PATH="./organizations/peerOrganizations/university-ca.example.com/users/Admin@university-ca.example.com/msp/keystore/priv_sk"

if [ ! -f "$CA_ADMIN_CERT_PATH" ]; then
    print_error "CA admin certificate not found at $CA_ADMIN_CERT_PATH"
    exit 1
fi

if [ ! -f "$CA_ADMIN_KEY_PATH" ]; then
    print_error "CA admin private key not found at $CA_ADMIN_KEY_PATH"
    exit 1
fi

print_success "CA admin MSP identity verified!"

# Step 3: Create seed admin info file
print_status "Creating seed admin info file..."
cat > seed-ca-admin-info.json << EOF
{
  "role": "CA_ADMIN",
  "name": "University Administrator",
  "email": "admin@university-ca.example.com",
  "mspId": "UniversityCAMSP",
  "certPath": "$CA_ADMIN_CERT_PATH",
  "keyPath": "$CA_ADMIN_KEY_PATH",
  "description": "Seed CA admin account for university administrators",
  "permissions": [
    "create_certificates",
    "update_certificate_status",
    "delete_certificates",
    "view_all_certificates",
    "manage_students"
  ],
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Step 4: Create student info file
print_status "Creating seed student info file..."
cat > seed-student-info.json << EOF
{
  "role": "STUDENT",
  "name": "Student User",
  "email": "student@student.example.com",
  "mspId": "StudentMSP",
  "certPath": "./organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/signcerts/User1@student.example.com-cert.pem",
  "keyPath": "./organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/keystore/priv_sk",
  "description": "Seed student account for testing",
  "permissions": [
    "view_own_certificates",
    "verify_certificates"
  ],
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

print_success "Seed accounts setup complete!"

print_status "Seed CA Admin Account Details:"
echo "=================================="
echo "Role: CA_ADMIN (University Administrator)"
echo "MSP ID: UniversityCAMSP"
echo "Email: admin@university-ca.example.com"
echo "Certificate: $CA_ADMIN_CERT_PATH"
echo "Private Key: $CA_ADMIN_KEY_PATH"
echo ""

print_status "Seed Student Account Details:"
echo "=================================="
echo "Role: STUDENT"
echo "MSP ID: StudentMSP"
echo "Email: student@student.example.com"
echo "Certificate: ./organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/signcerts/User1@student.example.com-cert.pem"
echo "Private Key: ./organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/keystore/priv_sk"
echo ""

print_warning "Important Security Notes:"
print_warning "1. These are seed accounts for testing/demo purposes"
print_warning "2. In production, generate new certificates for each user"
print_warning "3. Store private keys securely"
print_warning "4. Use proper certificate management practices"

print_status "Next Steps:"
print_status "1. Update your backend to use the MSP-based server (server-msp.ts)"
print_status "2. Update frontend to work with MSP authentication"
print_status "3. Test the role-based access control"
print_status "4. Deploy to production with proper certificate management"

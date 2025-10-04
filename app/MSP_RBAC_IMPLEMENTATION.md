# MSP-Based Role Access Control Implementation

## Overview

This document explains the implementation of role-based access control (RBAC) using Hyperledger Fabric MSP (Membership Service Provider) to replace the previous wallet-based authentication system.

## What is MSP-Based RBAC?

**MSP (Membership Service Provider)** is Fabric's built-in identity management system that provides:
- **Digital Certificates**: Each user has a unique X.509 certificate
- **Role Definition**: Roles are defined through MSP organizations
- **Secure Authentication**: No external tokens or wallet signatures needed
- **Built-in Authorization**: Fabric handles authentication at the blockchain level

## System Architecture

### Roles Defined

1. **CA_ADMIN (Certificate Authority/University Admin)**
   - MSP ID: `UniversityCAMSP`
   - Can create, update, delete certificates
   - Can view all certificates
   - Can manage certificate status

2. **STUDENT**
   - MSP ID: `StudentMSP`
   - Can view only their own certificates
   - Can verify any certificate (public operation)
   - Cannot modify certificates

### Network Configuration

```
Channel: msp-rbac-channel
Organizations:
├── UniversityCAMSP (CA Admin Organization)
│   ├── Admin@university-ca.example.com
│   └── User1@university-ca.example.com
└── StudentMSP (Student Organization)
    ├── Admin@student.example.com
    └── User1@student.example.com
```

## Implementation Details

### 1. Chaincode Updates (`assetTransfer.ts`)

The chaincode now includes role-based access control:

```typescript
// Role definitions based on MSP organizations
enum UserRole {
    CA_ADMIN = 'UniversityCAMSP',
    STUDENT = 'StudentMSP'
}

// Helper function to get user role from MSP identity
function getUserRole(ctx: Context): UserRole {
    const clientIdentity = ctx.clientIdentity;
    const mspId = clientIdentity.getMSPID();

    switch (mspId) {
        case 'UniversityCAMSP':
            return UserRole.CA_ADMIN;
        case 'StudentMSP':
            return UserRole.STUDENT;
        default:
            throw new Error(`Unknown MSP: ${mspId}`);
    }
}
```

**Access Control Rules:**
- `CreateAsset`: Only CA_ADMIN
- `UpdateAsset`: Only CA_ADMIN
- `DeleteAsset`: Only CA_ADMIN
- `ReadAsset`: CA_ADMIN (any), STUDENT (own only)
- `GetAllAssets`: Only CA_ADMIN
- `GetStudentCertificates`: Only STUDENT

### 2. Backend Updates

#### MSP Authentication Service (`mspAuth.ts`)
```typescript
export async function authenticateMSPUser(
    certPath: string,
    keyPath: string,
    mspId: string
): Promise<AuthResult>
```

#### MSP Middleware (`mspAuth.ts`)
- `authenticateMSP`: Validates MSP identity
- `requireCAAdmin`: Ensures CA admin role
- `requireStudent`: Ensures student role
- `requireCAAdminOrStudent`: Either role allowed

#### New Server (`server-msp.ts`)
Replaces wallet-based authentication with MSP-based endpoints:
- `/api/auth/msp-login`: MSP authentication
- `/api/certificates`: Certificate management (CA Admin)
- `/api/student/certificates`: Student certificates
- `/api/verify-certificate`: Public verification

### 3. Frontend Updates

#### MSP API Service (`mspApi.ts`)
```typescript
class MSPApiService {
    async authenticateUser(role: 'CA_ADMIN' | 'STUDENT'): Promise<AuthResult>
    async createCertificate(data: Partial<Certificate>, role: 'CA_ADMIN'): Promise<CertificateResponse>
    async getStudentCertificates(role: 'STUDENT'): Promise<CertificateResponse>
    // ... other methods
}
```

#### New Pages
- `/msp-login`: MSP-based login page
- `/ca-admin-dashboard`: CA admin interface
- `/student-dashboard`: Student interface

## Setup Instructions

### 1. Network Setup

```bash
# Navigate to test-network directory
cd app/blockchain/fabric-samples/test-network

# Run the MSP RBAC setup script
chmod +x setup-msp-rbac.sh
./setup-msp-rbac.sh

# Setup seed accounts
chmod +x setup-seed-accounts.sh
./setup-seed-accounts.sh
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd app/backend

# Install dependencies
npm install

# Start MSP-based server
npm run dev:msp
# or
node dist/server-msp.js
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Seed Accounts

### CA Admin Account
- **Role**: CA_ADMIN
- **MSP ID**: UniversityCAMSP
- **Email**: admin@university-ca.example.com
- **Permissions**: Full certificate management

### Student Account
- **Role**: STUDENT
- **MSP ID**: StudentMSP
- **Email**: student@student.example.com
- **Permissions**: View own certificates, verify certificates

## API Endpoints

### Authentication
- `POST /api/auth/msp-login` - MSP authentication
- `GET /api/auth/seed-ca-admin` - Get CA admin info
- `GET /api/auth/seed-student` - Get student info

### Certificate Management (CA Admin)
- `POST /api/certificates` - Create certificate
- `PUT /api/certificates/:id/status` - Update status
- `DELETE /api/certificates/:id` - Delete certificate
- `GET /api/certificates` - Get all certificates

### Student Operations
- `GET /api/student/certificates` - Get own certificates
- `GET /api/certificates/:id` - Get specific certificate

### Public Operations
- `POST /api/verify-certificate` - Verify certificate

## Security Benefits

### 1. **Eliminates External Dependencies**
- No wallet signatures required
- No JWT tokens needed
- Authentication handled by Fabric

### 2. **Enhanced Security**
- X.509 certificates provide strong identity verification
- Private keys stored securely
- No password-based authentication

### 3. **Role-Based Access**
- Roles defined at the blockchain level
- Cannot be bypassed by client-side manipulation
- Enforced by smart contract logic

### 4. **Audit Trail**
- All operations tracked with MSP identity
- Immutable blockchain records
- Complete transaction history

## Migration from Wallet-Based System

### What Changed
1. **Authentication**: Wallet signatures → MSP certificates
2. **Role Storage**: Database/memory → MSP organizations
3. **Session Management**: JWT tokens → MSP identity
4. **Authorization**: Middleware checks → Chaincode enforcement

### Benefits of Migration
1. **Simplified Architecture**: Fewer moving parts
2. **Enhanced Security**: Fabric-native authentication
3. **Better Performance**: No external signature verification
4. **Easier Management**: Roles managed through certificates

## Production Considerations

### 1. **Certificate Management**
- Generate unique certificates for each user
- Implement proper certificate lifecycle management
- Use Hardware Security Modules (HSMs) for key storage

### 2. **Network Security**
- Enable TLS for all communications
- Use proper certificate authorities
- Implement network policies

### 3. **User Onboarding**
- Automated certificate generation
- User registration workflows
- Role assignment processes

### 4. **Monitoring**
- Certificate expiration monitoring
- Access pattern analysis
- Security event logging

## Troubleshooting

### Common Issues

1. **Certificate Not Found**
   - Verify certificate paths in configuration
   - Check file permissions
   - Ensure certificates are properly generated

2. **MSP Authentication Failed**
   - Verify MSP ID matches configuration
   - Check certificate validity
   - Ensure private key matches certificate

3. **Access Denied Errors**
   - Verify user has correct MSP role
   - Check chaincode access control logic
   - Ensure proper certificate organization

### Debug Commands

```bash
# Check certificate validity
openssl x509 -in certificate.pem -text -noout

# Verify private key matches certificate
openssl x509 -noout -modulus -in certificate.pem | openssl md5
openssl rsa -noout -modulus -in private.key | openssl md5

# Test MSP connection
peer channel list --cafile ca.crt
```

## Conclusion

The MSP-based RBAC implementation provides a robust, secure, and scalable solution for role-based access control in the education credential verification system. By leveraging Fabric's native identity management capabilities, we've eliminated external dependencies while enhancing security and simplifying the overall architecture.

The system now provides:
- **Strong Authentication**: X.509 certificate-based identity
- **Granular Authorization**: Role-based access control at the blockchain level
- **Enhanced Security**: No external tokens or signatures required
- **Better Performance**: Native Fabric authentication
- **Easier Management**: Roles managed through MSP organizations

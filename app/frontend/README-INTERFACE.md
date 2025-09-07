# Frontend-Backend Interface Setup

This document describes the interface components that connect the frontend with the backend chaincode.

## Overview

The interface consists of several key components:

1. **Type Definitions** (`src/lib/types.ts`)
2. **API Service Layer** (`src/lib/api.ts`)
3. **Custom React Hooks** (`src/lib/hooks.ts`)
4. **Context Provider** (`src/lib/context.tsx`)
5. **UI Components** (`src/components/`)

## Architecture

```
Frontend (Next.js) ←→ API Layer ←→ Backend (Express) ←→ Hyperledger Fabric Chaincode
```

## Components

### 1. Type Definitions (`src/lib/types.ts`)

Defines TypeScript interfaces for:
- `Certificate` - Main certificate data structure
- `CreateCertificateRequest` - For creating new certificates
- `UpdateCertificateRequest` - For updating existing certificates
- `TransferCertificateRequest` - For transferring ownership
- `UpdateStatusRequest` - For updating certificate status
- `ApiResponse` - Generic API response wrapper

### 2. API Service Layer (`src/lib/api.ts`)

Provides functions to communicate with the backend:
- `getAllCertificates()` - Fetch all certificates
- `getCertificate(id)` - Fetch single certificate
- `createCertificate(data)` - Create new certificate
- `updateCertificate(id, data)` - Update certificate
- `deleteCertificate(id)` - Delete certificate
- `transferCertificate(id, data)` - Transfer ownership
- `updateCertificateStatus(id, data)` - Update status
- `certificateExists(id)` - Check existence

### 3. Custom React Hooks (`src/lib/hooks.ts`)

React hooks for state management:
- `useCertificates()` - Manage certificate list
- `useCertificate(id)` - Manage single certificate
- `useCreateCertificate()` - Handle certificate creation
- `useUpdateCertificate()` - Handle certificate updates
- `useDeleteCertificate()` - Handle certificate deletion
- `useTransferCertificate()` - Handle ownership transfer
- `useUpdateCertificateStatus()` - Handle status updates
- `useCertificateExists()` - Check certificate existence

### 4. Context Provider (`src/lib/context.tsx`)

Global state management using React Context:
- Manages certificate state across the application
- Provides convenience methods for state updates
- Handles loading and error states

### 5. UI Components

#### CertificateForm (`src/components/certificate-form.tsx`)
- Reusable form for creating and updating certificates
- Handles validation and submission
- Supports both create and update modes

#### CertificateList (`src/components/certificate-list.tsx`)
- Displays certificates in a table format
- Includes search and filtering capabilities
- Provides actions for view, edit, and delete

#### CertificateVerifier (`src/components/certificate-verifier.tsx`)
- Public verification interface
- Allows users to verify certificate authenticity
- Displays detailed certificate information

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=CertChain
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Backend Requirements

Ensure the backend is running and accessible at the configured URL. The backend should provide these endpoints:

- `GET /api/assets` - Get all certificates
- `GET /api/assets/:id` - Get specific certificate
- `POST /api/assets` - Create certificate
- `PUT /api/assets/:id` - Update certificate
- `DELETE /api/assets/:id` - Delete certificate
- `POST /api/assets/:id/transfer` - Transfer ownership
- `POST /api/assets/:id/status` - Update status
- `GET /api/assets/:id/exists` - Check existence

### 3. Usage Examples

#### Using the API directly:
```typescript
import { certificateApi } from '@/lib/api';

// Get all certificates
const certificates = await certificateApi.getAllCertificates();

// Create a certificate
await certificateApi.createCertificate({
  id: 'CERT001',
  owner: 'John Doe',
  department: 'Computer Science',
  // ... other fields
});
```

#### Using React hooks:
```typescript
import { useCertificates, useCreateCertificate } from '@/lib/hooks';

function MyComponent() {
  const { certificates, loading, error } = useCertificates();
  const { createCertificate, loading: createLoading } = useCreateCertificate();

  const handleCreate = async () => {
    await createCertificate({
      id: 'CERT001',
      owner: 'John Doe',
      // ... other fields
    });
  };

  return (
    <div>
      {loading ? 'Loading...' : certificates.map(cert => (
        <div key={cert.id}>{cert.owner}</div>
      ))}
    </div>
  );
}
```

#### Using the context:
```typescript
import { useCertificateContext } from '@/lib/context';

function MyComponent() {
  const { state, addCertificate } = useCertificateContext();

  return (
    <div>
      <p>Total certificates: {state.certificates.length}</p>
    </div>
  );
}
```

## Error Handling

The interface includes comprehensive error handling:

1. **API Level**: Network errors and HTTP status codes
2. **Hook Level**: Loading states and error messages
3. **Component Level**: User-friendly error displays
4. **Context Level**: Global error state management

## Security Considerations

1. **CORS**: Backend should be configured to allow frontend requests
2. **Validation**: Both frontend and backend should validate data
3. **Authentication**: Consider adding authentication middleware
4. **Rate Limiting**: Implement rate limiting on the backend

## Testing

To test the interface:

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/dashboard` to access the management interface
4. Navigate to `/verify` to test certificate verification
5. Use the browser's developer tools to monitor network requests

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend CORS is configured correctly
2. **Connection Refused**: Check if backend is running on the correct port
3. **Type Errors**: Ensure all required fields are provided in requests
4. **Loading States**: Check if hooks are properly handling async operations

### Debug Tips:

1. Check browser network tab for API requests
2. Use browser console for error messages
3. Verify environment variables are loaded correctly
4. Test API endpoints directly using tools like Postman
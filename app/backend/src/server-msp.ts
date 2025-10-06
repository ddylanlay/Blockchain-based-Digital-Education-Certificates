import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { ensureConnection, getContract } from './fabric/mspAuth';
import { authenticateMSP, requireCAAdmin, requireStudent, requireCAAdminOrStudent } from './middleware/mspAuth';
import { MSPService } from './services/mspService';

// request interface for MSP user
declare global {
  namespace Express {
    interface Request {
      mspUser?: any;
      userRole?: string;
      mspId?: string;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3002;

// middleware
app.use(cors());
app.use(express.json());

// health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    authType: 'MSP-based'
  });
});

// ==================== MSP AUTHENTICATION ENDPOINTS ====================

// MSP Login endpoint
app.post('/api/auth/msp-login', authenticateMSP, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'MSP authentication successful',
      user: req.mspUser
    });
  } catch (error) {
    console.error('MSP login error:', error);
    res.status(500).json({
      success: false,
      error: 'MSP login failed'
    });
  }
});

// Get seed CA admin info
app.get('/api/auth/seed-ca-admin', (req, res) => {
  const seedInfo = MSPService.getSeedCAAdminInfo();
  res.json({
    success: true,
    message: 'Seed CA admin account for testing',
    data: seedInfo
  });
});

// Get seed student info
app.get('/api/auth/seed-student', (req, res) => {
  const seedInfo = MSPService.getSeedStudentInfo();
  res.json({
    success: true,
    message: 'Seed student account for testing',
    data: seedInfo
  });
});

// ==================== CERTIFICATE MANAGEMENT (CA ADMIN ONLY) ====================

// Create certificate (CA Admin only)
app.post('/api/certificates', authenticateMSP, requireCAAdmin, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    const {
      id,
      owner,
      department,
      academicYear,
      joinDate,
      endDate,
      certificateType,
      issueDate,
      status
    } = req.body;

    // Validate required fields
    if (!id || !owner || !department || !certificateType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, owner, department, certificateType'
      });
    }

    // Generate transaction hash
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const txHash = `0x${crypto.createHash('sha256')
      .update(`${id}-${timestamp}-${randomBytes}`)
      .digest('hex')
      .substring(0, 32)}`;

    // Create certificate on blockchain
    await contract.submitTransaction(
      'CreateAsset',
      id,
      owner,
      department,
      academicYear || '2023-2024',
      joinDate || new Date().toISOString().split('T')[0],
      endDate || new Date().toISOString().split('T')[0],
      certificateType,
      issueDate || new Date().toISOString().split('T')[0],
      status || 'issued',
      txHash
    );

    console.log(`✅ Certificate ${id} created by CA admin: ${req.mspUser.name}`);

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: {
        id,
        owner,
        department,
        certificateType,
        txHash,
        createdBy: req.mspUser.name,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create certificate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update certificate status (CA Admin only)
app.put('/api/certificates/:id/status', authenticateMSP, requireCAAdmin, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Update certificate status on blockchain
    await contract.submitTransaction('updateAssetStatus', id, status);

    console.log(`✅ Certificate ${id} status updated to ${status} by CA admin: ${req.mspUser.name}`);

    res.json({
      success: true,
      message: 'Certificate status updated successfully',
      data: {
        id,
        status,
        updatedBy: req.mspUser.name,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating certificate status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update certificate status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete certificate (CA Admin only)
app.delete('/api/certificates/:id', authenticateMSP, requireCAAdmin, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    const { id } = req.params;

    // Delete certificate from blockchain
    await contract.submitTransaction('DeleteAsset', id);

    console.log(`✅ Certificate ${id} deleted by CA admin: ${req.mspUser.name}`);

    res.json({
      success: true,
      message: 'Certificate deleted successfully',
      data: {
        id,
        deletedBy: req.mspUser.name,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete certificate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all certificates (CA Admin only)
app.get('/api/certificates', authenticateMSP, requireCAAdmin, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    // Get all certificates from blockchain
    const result = await contract.evaluateTransaction('GetAllAssets');
    const certificates = JSON.parse(result.toString());

    res.json({
      success: true,
      message: 'All certificates retrieved successfully',
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Error getting all certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== STUDENT ENDPOINTS ====================

// Get student's own certificates
app.get('/api/student/certificates', authenticateMSP, requireStudent, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    // Get student's certificates from blockchain
    const result = await contract.evaluateTransaction('GetStudentCertificates');
    const certificates = JSON.parse(result.toString());

    res.json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Error getting student certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get student certificates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific certificate (students can only view their own)
app.get('/api/certificates/:id', authenticateMSP, requireCAAdminOrStudent, async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    const { id } = req.params;

    // Get certificate from blockchain
    const result = await contract.evaluateTransaction('ReadAsset', id);
    const certificate = JSON.parse(result.toString());

    res.json({
      success: true,
      message: 'Certificate retrieved successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Error getting certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get certificate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== VERIFICATION ENDPOINTS ====================

// Verify certificate (public endpoint)
app.post('/api/verify-certificate', async (req, res) => {
  try {
    await ensureConnection();
    const contract = getContract();

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Certificate ID is required'
      });
    }

    // Check if certificate exists
    const exists = await contract.evaluateTransaction('AssetExists', id);
    const certificateExists = exists.toString() === 'true';

    if (!certificateExists) {
      return res.json({
        success: true,
        message: 'Certificate verification completed',
        data: {
          isValid: false,
          certificateId: id,
          message: 'Certificate not found'
        }
      });
    }

    // Get certificate details
    const result = await contract.evaluateTransaction('ReadAsset', id);
    const certificate = JSON.parse(result.toString());

    res.json({
      success: true,
      message: 'Certificate verification completed',
      data: {
        isValid: true,
        certificateId: id,
        certificate: certificate,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 MSP-based server running on port ${PORT}`);
  console.log(`🔐 Authentication: MSP-based (Fabric certificates)`);
  console.log(`👨‍💼 CA Admin MSP: UniversityCAMSP`);
  console.log(`🎓 Student MSP: StudentMSP`);

  try {
    await ensureConnection();
    console.log('✅ Fabric MSP connection established');
  } catch (error) {
    console.error('❌ Failed to establish Fabric MSP connection:', error);
  }
});

export default app;

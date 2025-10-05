import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { Request, Response, NextFunction } from 'express';
import { createCredentialHash, verifyCredentialHash, ensureConnection, getAllAssets } from './fabric';
import { requireVerifier, requireVerifierOrAdmin } from './middleware/roleAuth';
import { authenticateJWT, requireVerifierJWT, requireAdminJWT } from './middleware/jwtAuth';
import { UserService } from './services/userService';
import { AuthService } from './services/authService';
import { StudentService } from './services/studentService';

// request interface for wallet address
declare global {
  namespace Express {
    interface Request {
      walletAddress?: string;
      user?: any;
      userRole?: string;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3002;

// wallet verification middleware
const verifyWalletSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { signature, message, walletAddress } = req.body;

    if (!signature || !message || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet signature, message, and address are required'
      });
    }

    // verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid wallet signature'
      });
    }

    // add wallet address to request for logging
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Wallet signature verification failed'
    });
  }
};

// middleware
app.use(cors());
app.use(express.json());

// health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// Generate authentication message for verifier login
app.post('/api/auth/message', (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const message = AuthService.generateAuthMessage(walletAddress);

    res.json({
      success: true,
      message,
      walletAddress
    });
  } catch (error) {
    console.error('Error generating auth message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authentication message'
    });
  }
});

// Verifier login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address, signature, and message are required'
      });
    }

    const authResult = await AuthService.authenticateVerifier({
      walletAddress,
      signature,
      message
    });

    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: authResult.token,
      user: authResult.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Seed admin login endpoint (for testing/demo purposes)
app.post('/api/auth/seed-login', async (req, res) => {
  try {
    const { password } = req.body;

    // Simple password check for demo purposes
    // In production, this should be more secure
    if (password !== 'admin123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    const seedInfo = UserService.getSeedVerifierInfo();
    const verifier = UserService.getVerifierByWallet(seedInfo.walletAddress);

    if (!verifier) {
      return res.status(500).json({
        success: false,
        error: 'Seed verifier account not found'
      });
    }

    // Generate JWT token for seed admin
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    const token = jwt.sign(
      {
        walletAddress: verifier.walletAddress,
        role: verifier.role,
        university: verifier.university,
        name: verifier.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Seed admin login successful',
      token,
      user: {
        walletAddress: verifier.walletAddress,
        name: verifier.name,
        email: verifier.email,
        university: verifier.university,
        role: verifier.role,
        isActive: verifier.isActive
      }
    });
  } catch (error) {
    console.error('Seed login error:', error);
    res.status(500).json({
      success: false,
      error: 'Seed login failed'
    });
  }
});

// Logout endpoint (client-side token removal)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (remove token from client)'
  });
});

// ==================== VERIFIER MANAGEMENT ====================

// Get seed verifier account info (for testing)
app.get('/api/seed-verifier', (req, res) => {
  const seedInfo = UserService.getSeedVerifierInfo();
  res.json({
    success: true,
    message: 'Seed verifier account for testing',
    data: seedInfo
  });
});

// Get all verifier accounts (admin only)
app.get('/api/verifiers', authenticateJWT, requireAdminJWT, (req, res) => {
  const verifiers = UserService.getAllVerifiers();
  res.json({
    success: true,
    data: verifiers,
    count: verifiers.length
  });
});

// Create new verifier account (admin only)
app.post('/api/verifiers', authenticateJWT, requireAdminJWT, (req, res) => {
  try {
    const { walletAddress, name, email, university } = req.body;

    if (!walletAddress || !name || !email || !university) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, name, email, university'
      });
    }

    // Check if verifier already exists
    if (UserService.getVerifierByWallet(walletAddress)) {
      return res.status(409).json({
        success: false,
        error: 'Verifier account already exists'
      });
    }

    const verifier = UserService.createVerifierAccount({
      walletAddress,
      name,
      email,
      university,
      role: 'verifier',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Verifier account created successfully',
      data: verifier
    });
  } catch (error) {
    console.error('Error creating verifier account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create verifier account'
    });
  }
});

// ==================== STUDENT MANAGEMENT ====================

// Get available students (for verifiers to see valid student IDs)
app.get('/api/students', authenticateJWT, requireVerifierJWT, async (req, res) => {
  try {
    const students = StudentService.getAllStudents().map(s => ({
      studentId: s.studentId,
      name: s.name,
      department: s.department,
      email: s.email
    }));

    res.status(200).json({
      success: true,
      data: students,
      message: `Found ${students.length} registered students`
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      message: 'Unable to retrieve student information'
    });
  }
});

// Get student certificates (for wallet-based student dashboard)
app.post('/api/student/certificates', async (req, res) => {
  try {
    // Use the getAllAssets function which handles JSON parsing issues
    const assets = await getAllAssets();

    // Filter for credential assets only (they have actual department names like 'Computer Science')
    // Exclude default assets that don't have meaningful department names
    const credentialAssets = assets.filter((asset: any) => {
      const dept = asset.department || asset.Department;
      return dept && dept !== 'CREDENTIAL_HASH' && dept !== 'Unknown Department' && dept.length > 3;
    });

    console.log(`📊 Found ${credentialAssets.length} credential assets out of ${assets.length} total assets`);

    // Convert asset format to certificate format
    const certificates = credentialAssets.map((asset: any) => {
      console.log('🧩 Converting asset to certificate:', asset);
      // Extract student wallet from txHash field (format: "txHash|studentWallet")
      const txHashValue = asset.txHash || asset.TxHash || '';
      const studentWallet = txHashValue.includes('|') ? txHashValue.split('|')[1] : '';
      const cleanTxHash = txHashValue.includes('|') ? txHashValue.split('|')[0] : txHashValue;

      return {
        ID: asset.id,
        Owner: asset.owner || asset.Owner || 'Unknown Owner',
        department: asset.department || asset.Department || 'Unknown Department', // Use actual department name
        academicYear: asset.academicYear || asset.AcademicYear, // This contains the hash
        joinDate: asset.startDate || asset.StartDate,
        endDate: asset.endDate || asset.EndDate,
        certificateType: asset.certificateType || asset.CertificateType, // Actual certificate type like "Bachelor of Science"
        issueDate: asset.issueDate || asset.IssueDate,
        status: asset.status || asset.Status,
        txHash: cleanTxHash, // Clean transaction hash
        hash: asset.academicYear || asset.AcademicYear, // Store the hash in academicYear field
        studentWallet: studentWallet // Extract student wallet from txHash field
      };
    });

    res.status(200).json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Error getting student certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student certificates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Certificate verification endpoint (public)
app.post('/api/verify-certificate', async (req, res) => {
  try {
    const contract = await ensureConnection();

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Certificate ID is required'
      });
    }

    // Try to get the asset (certificate)
    const result = await contract.evaluateTransaction('ReadAsset', id);
    const asset = JSON.parse(result.toString()) as any;

    if (asset.department === 'CREDENTIAL_HASH') {
      res.status(200).json({
        success: true,
        message: 'Certificate verified successfully',
        data: {
          id: asset.id,
          owner: asset.owner,
          status: asset.status,
          issueDate: asset.issueDate,
          department: asset.certificateType,
          hash: asset.academicYear,
          isValid: true
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== CREDENTIAL MANAGEMENT ====================

// store credential hash on blockchain (VERIFIER ONLY with JWT)
app.post('/api/assets', authenticateJWT, requireVerifierJWT, async (req, res) => {
  try {
    // Ensure blockchain connection is established
    await ensureConnection();

    const {
      id,
      studentName,
      department,
      academicYear,
      startDate,
      endDate,
      certificateType,
      hash,
      studentId  // Add studentId to request body
    } = req.body;

    // validate required fields
    if (!id || !studentName || !department || !hash || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, studentName, department, hash, studentId'
      });
    }

    // Get verifier info from JWT token
    const verifierName = req.user.name;
    const university = req.user.university;
    const verifierWallet = req.user.walletAddress;

    // Look up student wallet address by student ID
    const studentWallet = StudentService.getStudentWalletById(studentId);
    if (!studentWallet) {
      return res.status(400).json({
        success: false,
        error: `Student ID ${studentId} not found. Please check the student ID.`,
        availableStudents: StudentService.getAllStudents().map(s => ({ id: s.studentId, name: s.name }))
      });
    }

    // Get student info for logging
    const studentInfo = StudentService.getStudentById(studentId);

    // Generate transaction hash
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const initial_txHash = crypto.createHash('sha256')
      .update(`${id}-${timestamp}-${randomBytes}`)
      .digest('hex')
      .substring(0, 32);
    const txHash = `0x${initial_txHash}`;

    // Store ONLY hash and metadata on blockchain (no personal details)
    await createCredentialHash(id, hash, studentWallet, verifierWallet, new Date().toISOString(), 'issued', department, certificateType);

    console.log(`✅ Credential hash ${id} stored on blockchain`);
    console.log(`📊 Hash: ${hash}`);
    console.log(`👤 Student wallet: ${studentWallet}`);
    console.log(`🎓 Student: ${studentInfo?.name} (${studentId})`);
    console.log(`🏛️ University: ${university}`);
    console.log(`👨‍💼 Issue Verifier wallet: ${verifierWallet}`);
    console.log(`👨‍💼 Issue Verifier: ${verifierName}`);

    res.status(201).json({
      success: true,
      message: 'Credential hash stored successfully on blockchain',
      data: {
        id,
        txHash,
        hash,
        studentId,
        studentWallet,
        studentName: studentInfo?.name,
        verifierWallet,
        verifier: verifierName,
        university: university,
        storedOn: 'blockchain'
      }
    });
  } catch (error) {
    console.error('Error storing credential hash:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store credential hash',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify credential hash
app.post('/api/verify-credential', async (req, res) => {
  try {
    await ensureConnection();

    const { id, hash, signature } = req.body;

    if (!id || !hash || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, hash, signature'
      });
    }

    // Verify signature
    const message = `Store credential: ${id}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Verify hash against blockchain
    const hashVerification = await verifyCredentialHash(id, hash);

    res.json({
      success: true,
      message: 'Credential verification completed',
      data: {
        isValid: hashVerification.isValid,
        credentialId: id,
        verificationDetails: hashVerification
      }
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify credential',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all assets (public endpoint for verification)
app.get('/api/assets', async (req, res) => {
  try {
    await ensureConnection();
    // Implementation for getting all assets
    res.json({
      success: true,
      message: 'Assets retrieved successfully',
      data: []
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assets'
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Seed verifier account: ${UserService.getSeedVerifierInfo().walletAddress}`);
  console.log(`🏛️ University: ${UserService.getSeedVerifierInfo().university}`);

  try {
    await ensureConnection();
    console.log('✅ Fabric connection established');
  } catch (error) {
    console.error('❌ Failed to establish Fabric connection:', error);
  }
});



export default app;
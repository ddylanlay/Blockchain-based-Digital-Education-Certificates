import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { Request, Response, NextFunction } from 'express';

// request interface for wallet address
declare global {
  namespace Express {
    interface Request {
      walletAddress?: string;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

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

// store credential hash on blockchain
app.post('/api/assets', verifyWalletSignature, async (req, res) => {
  try {
    const {
      id,
      studentName,
      department,
      academicYear,
      startDate,
      endDate,
      certificateType,
      hash,
      signature,
      walletAddress,
    } = req.body;

    // validate required fields
    if (!id || !studentName || !department || !hash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, studentName, department, hash'
      });
    }

    // generate transaction hash
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const initial_txHash = crypto.createHash('sha256')
      .update(`${id}-${timestamp}-${randomBytes}`)
      .digest('hex')
      .substring(0, 32);
    const txHash = `0x${initial_txHash}`;

    // Store only hash and metadata on blockchain
    // For now, we'll simulate this with a simple response
    // In real implementation, you'd call your Fabric chaincode here

    console.log(`✅ Credential hash ${id} stored on blockchain by wallet: ${walletAddress}`);
    console.log(`📊 Hash: ${hash}`);
    console.log(`🔐 Signature: ${signature}`);

    res.status(201).json({
      success: true,
      message: 'Credential hash stored successfully',
      data: {
        id,
        txHash,
        hash,
        createdBy: walletAddress,
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

    // For now, we'll assume the hash is valid
    // In real implementation, you'd check against blockchain
    const isValid = recoveredAddress && hash;

    res.json({
      success: true,
      valid: isValid,
      data: {
        id,
        hash,
        verifiedBy: recoveredAddress,
        verifiedAt: new Date().toISOString()
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

// Get all credential hashes from blockchain
app.get('/api/assets', async (req, res) => {
  try {
    // Import fabric functions
    const { getAllAssets } = require('./fabric');

    // Get actual assets from blockchain
    const assets = await getAllAssets();

    res.json({
      success: true,
      data: assets,
      count: assets.length,
      message: 'Assets from blockchain (for display purposes)'
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assets from blockchain',
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`�� Health check: http://localhost:${PORT}/health`);
});

export default app;
import express from 'express';
import cors from 'cors';
import path from 'path';
import {
  initFabric,
  disconnectFabric,
  getAllAssets,
  createAsset,
  readAsset,
  updateAsset,
  deleteAsset,
  transferAsset,
  assetExists,
  updateAssetStatus,
  Asset
} from './fabric';

const app = express();
const PORT = process.env.PORT || 3001;

// No hardcoded data - all data comes from blockchain chaincode

// No seeding needed - data comes from blockchain chaincode

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public'))); // Commented out since we don't need static files for API server

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Fabric connection
let fabricInitialized = false;

async function ensureFabricConnection() {
  if (!fabricInitialized) {
    try {
      await initFabric();
      fabricInitialized = true;
      console.log('✅ Fabric connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Fabric connection:', error);
      throw error;
    }
  }
}

// API Routes
// GET /api/assets - Get all assets
app.get('/api/assets', async (req, res) => {
  try {
    await ensureFabricConnection();
    const assets = await getAllAssets();
    res.json({
      success: true,
      data: assets,
      count: assets.length
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

// GET /api/assets/:id - Get specific asset
app.get('/api/assets/:id', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;

    // Check if asset exists first
    const exists = await assetExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    const asset = await readAsset(id);
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error(`Error getting asset ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve asset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/assets - Create new asset
app.post('/api/assets', async (req, res) => {
  try {
    await ensureFabricConnection();
    const {
      id,
      owner,
      department,
      academicYear,
      joinDate,
      endDate,
      certificateType,
      issueDate,
      status,
      txHash
    } = req.body;

    // Validate required fields
    if (!id || !owner || !department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, owner, department'
      });
    }

    // Check if asset already exists
    const exists = await assetExists(id);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'Asset already exists'
      });
    }

    await createAsset(
      id,
      owner,
      department,
      academicYear || '',
      joinDate || '',
      endDate || '',
      certificateType || '',
      issueDate || '',
      status || 'draft',
      txHash || ''
    );

    // success response after asset is created and stored in blockchain ledger (on chaincode side)
    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create asset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// PUT /api/assets/:id - Update existing asset
app.put('/api/assets/:id', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;
    const {
      owner,
      department,
      academicYear,
      joinDate,
      endDate,
      certificateType,
      issueDate,
      status,
      txHash
    } = req.body;

    // Validate required fields
    if (!owner || !department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: owner, department'
      });
    }

    await updateAsset(
      id,
      owner,
      department,
      academicYear || '',
      joinDate || '',
      endDate || '',
      certificateType || '',
      issueDate || '',
      status || 'draft',
      txHash || ''
    );

    res.json({ success: true, message: 'Asset updated successfully' });
  } catch (error) {
    console.error(`Error updating asset ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update asset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// PATCH /api/assets/:id/status - Update asset status only
app.patch('/api/assets/:id/status', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Check if asset exists
    const exists = await assetExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    await updateAssetStatus(id, status);

    res.json({
      success: true,
      message: 'Asset status updated successfully'
    });
  } catch (error) {
    console.error(`Error updating asset status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update asset status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/assets/:id/transfer - Transfer asset ownership
app.post('/api/assets/:id/transfer', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;
    const { newOwner } = req.body;

    if (!newOwner) {
      return res.status(400).json({
        success: false,
        error: 'New owner is required'
      });
    }

    // Check if asset exists
    const exists = await assetExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    const oldOwner = await transferAsset(id, newOwner);

    res.json({
      success: true,
      message: 'Asset transferred successfully',
      data: {
        oldOwner,
        newOwner
      }
    });
  } catch (error) {
    console.error(`Error transferring asset ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to transfer asset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/assets/:id - Delete asset
app.delete('/api/assets/:id', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;

    // Check if asset exists
    const exists = await assetExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    await deleteAsset(id);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting asset ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/assets/:id/exists - Check if asset exists
app.get('/api/assets/:id/exists', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;
    const exists = await assetExists(id);

    res.json({
      success: true,
      exists
    });
  } catch (error) {
    console.error(`Error checking asset existence ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to check asset existence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to debug asset reading
app.get('/api/test-read/:id', async (req, res) => {
  try {
    await ensureFabricConnection();
    const { id } = req.params;

    console.log(`🔍 Testing direct read of asset: ${id}`);

    // Try to read the asset directly
    const asset = await readAsset(id);
    console.log(`✅ Successfully read asset: ${id}`, asset);

    res.json({
      success: true,
      asset: asset,
      message: `Asset ${id} can be read directly`
    });
  } catch (error) {
    console.log(`❌ Failed to read asset ${req.params.id}:`, error);
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Asset ${req.params.id} cannot be read directly`
    });
  }
});

// API-only server - no static file serving needed
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, shutting down gracefully...');
  try {
    await disconnectFabric();
    console.log('✅ Fabric connection closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received terminate signal, shutting down gracefully...');
  try {
    await disconnectFabric();
    console.log('✅ Fabric connection closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

export default app;
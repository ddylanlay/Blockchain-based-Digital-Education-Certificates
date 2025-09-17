// fabric.ts - Direct crypto approach (no wallet required)
import { connect, Contract, Identity, Signer, signers, hash, Gateway, Network } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

// Network configuration constants
const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspId = 'Org1MSP';

// Asset interface matching your chaincode structure
import type { Asset } from './types';

// Global connection objects
let gateway: Gateway | null = null;
let network: Network | null = null;
let contract: Contract | null = null;
let isConnected = false;

/**
 * Initialize connection to Hyperledger Fabric network
 */
export async function initFabric(): Promise<void> {
  try {
    console.log('🔌 Initializing Fabric connection...'); //ensures network connection is established

    // Create gRPC connection
    const peerEndpoint = 'localhost:7051'; // peer node's network address
    const peerHostAlias = 'peer0.org1.example.com'; // TLS hostname override
    const tlsCertPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'blockchain',
      'fabric-samples',
      'test-network',
      'organizations',
      'peerOrganizations',
      'org1.example.com',
      'peers',
      'peer0.org1.example.com',
      'tls',
      'ca.crt'
    ); // path to peer tls certificate to establish secure TLS connection

    const tlsRootCert = fs.readFileSync(tlsCertPath); // reads TLS cert file from disk -> uses cert data to verify peer's identity
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert); // enables encrypted comms between our app and fabric peer
    const client = new grpc.Client(peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': peerHostAlias,
    }); // creates gRPC client with TLS credentials and hostname override (since we're using localhost instead of cert's hostname)

    // Create identity and signer
    const certPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'blockchain',
      'fabric-samples',
      'test-network',
      'organizations',
      'peerOrganizations',
      'org1.example.com',
      'users',
      'User1@org1.example.com',
      'msp',
      'signcerts',
      'User1@org1.example.com-cert.pem'
    ); // path to user certificate -> identity cert to prove who we are to the Fabric network ( pre created test user)
    const keyPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'blockchain',
      'fabric-samples',
      'test-network',
      'organizations',
      'peerOrganizations',
      'org1.example.com',
      'users',
      'User1@org1.example.com',
      'msp',
      'keystore',
      'priv_sk'
    ); // path to user private key -> identity key to sign transactions ( pre created test user)

    const identity = await newIdentity(certPath, mspId); // creates identity object with cert path and msp id
    const signer = await newSigner(keyPath); // creates signer object from private key

    // Connect to gateway
    gateway = connect({
      client,
      identity,
      signer,
      hash: hash.sha256,
    });

    // Get the network (channel) our contract is deployed to
    network = gateway.getNetwork(channelName);
    console.log(`✅ Connected to channel: ${channelName}`);

    // Get the contract from the network
    contract = network.getContract(chaincodeName);
    console.log(`✅ Connected to chaincode: ${chaincodeName}`);

    isConnected = true;
    console.log('🎉 Fabric connection initialization complete');

  } catch (error) {
    console.error('❌ Failed to connect to Fabric network:', error);
    isConnected = false;

    // Cleanup on failure
    if (gateway) {
      gateway.close();
      gateway = null;
      network = null;
      contract = null;
    }

    throw error;
  }
}

async function newIdentity(certPath: string, mspId: string): Promise<Identity> {
  const credentials = fs.readFileSync(certPath);
  return { mspId, credentials };
}

async function newSigner(keyPath: string): Promise<Signer> {
  const privateKeyPem = fs.readFileSync(keyPath, 'utf8');
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

/**
 * Disconnect from the Fabric gateway
 */
export async function disconnectFabric(): Promise<void> {
  try {
    if (gateway) {
      gateway.close();
      console.log('✅ Disconnected from Fabric gateway');
    }
  } catch (error) {
    console.error('❌ Error during disconnect:', error);
  } finally {
    gateway = null;
    network = null;
    contract = null;
    isConnected = false;
  }
}

/**
 * Ensure we have an active connection to Fabric
 */
async function ensureConnection(): Promise<Contract> {
  if (!isConnected || !contract) {
    await initFabric();
  }

  if (!contract) {
    throw new Error('Failed to establish contract connection');
  }

  return contract;
}

/**
 * Get all assets from the ledger
 */
export async function getAllAssets(): Promise<Asset[]> {
  try {
    console.log('📋 Getting all assets...');
    const activeContract = await ensureConnection();

    const result = await activeContract.evaluateTransaction('GetAllAssets');
    const resultStr = result.toString();
    console.log('================ RAW GetAllAssets result ================\n' + resultStr + '\n========================================================');

    let assets;
    try {
      // Check if the result is a comma-separated list of ASCII values
      if (resultStr.includes(',') && /^\d+(,\d+)*$/.test(resultStr)) {
        console.log('🔧 Converting ASCII values to string...');
        // Convert comma-separated ASCII values to string
        const asciiValues = resultStr.split(',').map((num: string) => parseInt(num.trim()));
        const jsonString = String.fromCharCode(...asciiValues);
        console.log('🔧 Converted to JSON string:', jsonString);
        assets = JSON.parse(jsonString);
      } else {
        // Try parsing as regular JSON
        assets = JSON.parse(resultStr);
      }
    } catch (parseErr) {
      // Always log the raw result on parse error
      console.error('❌ JSON parse error in getAllAssets:', parseErr);
      console.error('================ RAW RESULT ON ERROR ================\n' + resultStr + '\n====================================================');
      throw new Error('Malformed JSON returned from chaincode.');
    }

    console.log(`✅ Retrieved ${Array.isArray(assets) ? assets.length : 0} assets`);

    // Format assets like smart-fabric.sh
    if (Array.isArray(assets) && assets.length > 0) {
      console.log('\n📊 Current Assets:');
      console.log('==================');
      const formattedAssets = assets.map(asset => ({
        id: asset.id,
        owner: asset.owner,
        department: asset.department,
        academicYear: asset.academicYear,
        startDate: asset.startDate,
        endDate: asset.endDate,
        certificateType: asset.certificateType,
        issueDate: asset.issueDate,
        status: asset.status,
        txHash: asset.txHash || ""
      }));
      console.log(JSON.stringify(formattedAssets, null, 2));
      console.log('==================\n');
    }
    return assets;
  } catch (error) {
    console.error('❌ Failed to get all assets:', error);
    throw new Error(`Failed to get all assets: ${error}`);
  }
}

/**
 * Create a new asset on the ledger (blockchain)
 */
export async function createAsset(
  id: string,
  owner: string,
  department: string,
  academicYear: string,
  startDate: string,
  endDate: string,
  certificateType: string,
  issueDate: string,
  status: string,
  txHash: string
): Promise<void> {
  try {
    console.log(`📝 Creating asset: ${id}`);
    const activeContract = await ensureConnection();

    await activeContract.submitTransaction(
      'CreateAsset',
      id,
      owner,
      department,
      academicYear,
      startDate,
      endDate,
      certificateType,
      issueDate,
      status,
      txHash
    );

     // Show the created asset in formatted way
     const newAsset = {
      id: id,
      owner: owner,
      department: department,
      academicYear: academicYear,
      startDate: startDate,
      endDate: endDate,
      certificateType: certificateType,
      issueDate: issueDate,
      status: status,
      txHash: txHash
    };

    console.log('\n�� New Asset Created:');
    console.log('====================');
    console.log(JSON.stringify(newAsset, null, 2));
    console.log('====================\n');

  } catch (error) {
    console.error(`❌ Failed to create asset ${id}:`, error);
    throw new Error(`Failed to create asset ${id}: ${error}`);
  }
}

/**
 * Read a specific asset from the ledger
 */
export async function readAsset(id: string): Promise<Asset> {
  try {
    console.log(`👀 Reading asset: ${id}`);
    const activeContract = await ensureConnection();

    const result = await activeContract.evaluateTransaction('ReadAsset', id);
    const resultStr = result.toString();

    let asset;
    try {
      // Check if the result is a comma-separated list of ASCII values
      if (resultStr.includes(',') && /^\d+(,\d+)*$/.test(resultStr)) {
        console.log('🔧 Converting ASCII values to string for ReadAsset...');
        // Convert comma-separated ASCII values to string
        const asciiValues = resultStr.split(',').map((num: string) => parseInt(num.trim()));
        const jsonString = String.fromCharCode(...asciiValues);
        asset = JSON.parse(jsonString);
      } else {
        // Try parsing as regular JSON
        asset = JSON.parse(resultStr);
      }
    } catch (parseErr) {
      console.error('❌ JSON parse error in readAsset:', parseErr);
      throw new Error(`Failed to parse asset data: ${parseErr}`);
    }

    console.log(`✅ Asset ${id} retrieved successfully`);
    return asset;
  } catch (error) {
    console.error(`❌ Failed to read asset ${id}:`, error);
    // Check if it's the "does not exist" error from chaincode
    if (error instanceof Error && error.message.includes('does not exist')) {
      throw new Error(`Asset ${id} does not exist`);
    }
    throw new Error(`Failed to read asset ${id}: ${error}`);
  }
}

/**
 * Update an existing asset on the ledger
 */
export async function updateAsset(
  id: string,
  owner: string,
  department: string,
  academicYear: string,
  startDate: string,
  endDate: string,
  certificateType: string,
  issueDate: string,
  status: string,
  txHash: string
): Promise<void> {
  try {
    console.log(`✏️ Updating asset: ${id}`);
    const activeContract = await ensureConnection();

    await activeContract.submitTransaction(
      'UpdateAsset',
      id,
      owner,
      department,
      academicYear,
      startDate,
      endDate,
      certificateType,
      issueDate,
      status,
      txHash
    );

    // Show the updated asset in formatted way
    const updatedAsset = {
      id: id,
      owner: owner,
      department: department,
      academicYear: academicYear,
      startDate: startDate,
      endDate: endDate,
      certificateType: certificateType,
      issueDate: issueDate,
      status: status,
      txHash: txHash
    };

    console.log('\n�� Asset Updated:');
    console.log('=================');
    console.log(JSON.stringify(updatedAsset, null, 2));
    console.log('=================\n');
  } catch (error) {
    console.error(`❌ Failed to update asset ${id}:`, error);
    throw new Error(`Failed to update asset ${id}: ${error}`);
  }
}

/**
 * Delete an asset from the ledger
 */
export async function deleteAsset(id: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting asset: ${id}`);

    // First check if asset exists
    const exists = await assetExists(id);
    if (!exists) {
      throw new Error(`Asset ${id} does not exist`);
    }

    const activeContract = await ensureConnection();
    await activeContract.submitTransaction('DeleteAsset', id);

    console.log(`✅ Asset ${id} deleted successfully`);
  } catch (error) {
    console.error(`❌ Failed to delete asset ${id}:`, error);
    throw new Error(`Failed to delete asset ${id}: ${error}`);
  }
}

/**
 * Transfer asset ownership to a new owner
 */
export async function transferAsset(id: string, newOwner: string): Promise<string> {
  try {
    console.log(`🔄 Transferring asset ${id} to: ${newOwner}`);
    const activeContract = await ensureConnection();

    const result = await activeContract.submitTransaction('TransferAsset', id, newOwner);
    const oldOwner = result.toString();

    console.log(`✅ Asset ${id} transferred from ${oldOwner} to ${newOwner}`);
    return oldOwner;
  } catch (error) {
    console.error(`❌ Failed to transfer asset ${id}:`, error);
    throw new Error(`Failed to transfer asset ${id}: ${error}`);
  }
}

/**
 * Check if an asset exists on the ledger
 */
export async function assetExists(id: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if asset exists: ${id}`);
    const allAssets = await getAllAssets();
    const exists = allAssets.some(asset => asset.id === id);

    console.log(`✅ Asset ${id} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`❌ Failed to check if asset ${id} exists:`, error);
    return false; // Return false instead of throwing error
  }
}

/**
 * Update only the status of an asset
 */
export async function updateAssetStatus(id: string, status: string): Promise<void> {
  try {
    console.log(`🏷️ Updating asset ${id} status to: ${status}`);
    const activeContract = await ensureConnection();

    // Check if UpdateAssetStatus function exists in your chaincode
    // If not, we'll read the asset first, then update it with new status
    try {
      await activeContract.submitTransaction('UpdateAssetStatus', id, status);
    } catch (statusError) {
      // Fallback: read asset and update with new status
      console.log('UpdateAssetStatus not available, using UpdateAsset fallback');
      const asset = await readAsset(id);

      // If status is changing to "issued" and issueDate is empty, set it to today
      let issueDate = asset.issueDate;
      if (status === 'issued' && (!issueDate || issueDate === '')) {
        issueDate = new Date().toISOString().split('T')[0]; // Today's date
        console.log(`�� Setting issue date to ${issueDate} for asset ${id}`);
      }

      await updateAsset(
        id,
        asset.owner,
        asset.department,
        asset.academicYear,
        asset.startDate,
        asset.endDate,
        asset.certificateType,
        issueDate, // Use the potentially updated issueDate
        status, // Only change the status
        asset.txHash
      );
    }

    console.log(`✅ Asset ${id} status updated to ${status}`);
  } catch (error) {
    console.error(`❌ Failed to update asset ${id} status:`, error);
    throw new Error(`Failed to update asset ${id} status: ${error}`);
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  channelName: string;
  chaincodeName: string;
  mspId: string;
} {
  return {
    isConnected,
    channelName,
    chaincodeName,
    mspId
  };
}

/**
 * Get asset history (if supported by chaincode)
 */
export async function getAssetHistory(id: string): Promise<any[]> {
  try {
    console.log(`📜 Getting history for asset: ${id}`);
    const activeContract = await ensureConnection();

    const result = await activeContract.evaluateTransaction('GetAssetHistory', id);
    const resultStr = result.toString();

    let history;
    try {
      // Check if the result is a comma-separated list of ASCII values
      if (resultStr.includes(',') && /^\d+(,\d+)*$/.test(resultStr)) {
        console.log('🔧 Converting ASCII values to string for GetAssetHistory...');
        // Convert comma-separated ASCII values to string
        const asciiValues = resultStr.split(',').map((num: string) => parseInt(num.trim()));
        const jsonString = String.fromCharCode(...asciiValues);
        history = JSON.parse(jsonString);
      } else {
        // Try parsing as regular JSON
        history = JSON.parse(resultStr);
      }
    } catch (parseErr) {
      console.error('❌ JSON parse error in getAssetHistory:', parseErr);
      return []; // Return empty array if parsing fails
    }

    console.log(`✅ Retrieved history for asset ${id}`);
    return history;
  } catch (error) {
    console.error(`❌ Failed to get asset history for ${id}:`, error);
    // Don't throw error if history function doesn't exist
    console.log('Asset history function may not be implemented in chaincode');
    return [];
  }
}

/**
 * Query assets by owner
 */
export async function getAssetsByOwner(owner: string): Promise<Asset[]> {
  try {
    console.log(`🔍 Getting assets by owner: ${owner}`);
    const allAssets = await getAllAssets();
    const ownerAssets = allAssets.filter(asset => asset.owner === owner);

    console.log(`✅ Found ${ownerAssets.length} assets for owner: ${owner}`);
    return ownerAssets;
  } catch (error) {
    console.error(`❌ Failed to get assets by owner ${owner}:`, error);
    throw new Error(`Failed to get assets by owner ${owner}: ${error}`);
  }
}

/**
 * Query assets by status
 */
export async function getAssetsByStatus(status: string): Promise<Asset[]> {
  try {
    console.log(`🔍 Getting assets by status: ${status}`);
    const allAssets = await getAllAssets();
    const statusAssets = allAssets.filter(asset => asset.status === status);

    console.log(`✅ Found ${statusAssets.length} assets with status: ${status}`);
    return statusAssets;
  } catch (error) {
    console.error(`❌ Failed to get assets by status ${status}:`, error);
    throw new Error(`Failed to get assets by status ${status}: ${error}`);
  }
}
// MSP-based authentication service
import { connect, Contract, Identity, Signer, signers, hash, Gateway, Network } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

// Network configuration constants
const channelName = 'msp-rbac-channel';
const chaincodeName = 'basic';

// MSP configuration for different roles
const MSP_CONFIG = {
    CA_ADMIN: {
        mspId: 'UniversityCAMSP',
        certPath: path.resolve(__dirname, '../../blockchain/fabric-samples/test-network/organizations/peerOrganizations/university-ca.example.com/users/Admin@university-ca.example.com/msp/signcerts/Admin@university-ca.example.com-cert.pem'),
        keyPath: path.resolve(__dirname, '../../blockchain/fabric-samples/test-network/organizations/peerOrganizations/university-ca.example.com/users/Admin@university-ca.example.com/msp/keystore/priv_sk')
    },
    STUDENT: {
        mspId: 'StudentMSP',
        certPath: path.resolve(__dirname, '../../blockchain/fabric-samples/test-network/organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/signcerts/User1@student.example.com-cert.pem'),
        keyPath: path.resolve(__dirname, '../../blockchain/fabric-samples/test-network/organizations/peerOrganizations/student.example.com/users/User1@student.example.com/msp/keystore/priv_sk')
    }
};

// Global connection objects
let gateway: Gateway | null = null;
let network: Network | null = null;
let contract: Contract | null = null;
let isConnected = false;

export interface MSPUser {
    mspId: string;
    userId: string;
    role: 'CA_ADMIN' | 'STUDENT';
    name: string;
    email: string;
}

export interface AuthResult {
    success: boolean;
    user?: MSPUser;
    error?: string;
}

/**
 * Initialize connection to Hyperledger Fabric network
 */
export async function initFabric(): Promise<void> {
    try {
        console.log('🔌 Initializing MSP-based Fabric connection...');

        // Create gRPC connection
        const peerEndpoint = 'localhost:7051';
        const peerHostAlias = 'peer0.university-ca.example.com';
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
            'university-ca.example.com',
            'peers',
            'peer0.university-ca.example.com',
            'tls',
            'ca.crt'
        );

        const tlsRootCert = fs.readFileSync(tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        const client = new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });

        // Use CA Admin identity for system operations
        const identity = await newIdentity(MSP_CONFIG.CA_ADMIN.certPath, MSP_CONFIG.CA_ADMIN.mspId);
        const signer = await newSigner(MSP_CONFIG.CA_ADMIN.keyPath);

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
        console.log('🎉 MSP-based Fabric connection initialization complete');

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

/**
 * Authenticate user using MSP identity
 */
export async function authenticateMSPUser(certPath: string, keyPath: string, mspId: string): Promise<AuthResult> {
    try {
        // Create identity and signer
        const identity = await newIdentity(certPath, mspId);
        const signer = await newSigner(keyPath);

        // Create a temporary gateway connection for authentication
        const peerEndpoint = 'localhost:7051';
        const peerHostAlias = 'peer0.university-ca.example.com';
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
            'university-ca.example.com',
            'peers',
            'peer0.university-ca.example.com',
            'tls',
            'ca.crt'
        );

        const tlsRootCert = fs.readFileSync(tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        const client = new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });

        const tempGateway = connect({
            client,
            identity,
            signer,
            hash: hash.sha256,
        });

        // Test the connection by trying to get the network
        const tempNetwork = tempGateway.getNetwork(channelName);
        const tempContract = tempNetwork.getContract(chaincodeName);

        // Try to invoke a simple query to verify the identity works
        await tempContract.evaluateTransaction('AssetExists', 'test-id');

        // Close temporary connection
        tempGateway.close();

        // Determine role based on MSP ID
        let role: 'CA_ADMIN' | 'STUDENT';
        let name: string;
        let email: string;

        if (mspId === 'UniversityCAMSP') {
            role = 'CA_ADMIN';
            name = 'University Administrator';
            email = 'admin@university-ca.example.com';
        } else if (mspId === 'StudentMSP') {
            role = 'STUDENT';
            name = 'Student User';
            email = 'student@student.example.com';
        } else {
            throw new Error(`Unknown MSP: ${mspId}`);
        }

        const user: MSPUser = {
            mspId,
            userId: identity.calculateMSPId(),
            role,
            name,
            email
        };

        return {
            success: true,
            user
        };

    } catch (error) {
        console.error('MSP authentication error:', error);
        return {
            success: false,
            error: 'MSP authentication failed'
        };
    }
}

/**
 * Get MSP configuration for a specific role
 */
export function getMSPConfig(role: 'CA_ADMIN' | 'STUDENT') {
    return MSP_CONFIG[role];
}

/**
 * Create a new identity from certificate and MSP ID
 */
async function newIdentity(certPath: string, mspId: string): Promise<Identity> {
    const credentials = await fs.promises.readFile(certPath);
    return { mspId, credentials };
}

/**
 * Create a new signer from private key
 */
async function newSigner(keyPath: string): Promise<Signer> {
    const privateKeyPem = await fs.promises.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * Ensure connection is established
 */
export async function ensureConnection(): Promise<void> {
    if (!isConnected || !gateway || !network || !contract) {
        await initFabric();
    }
}

/**
 * Get the contract instance
 */
export function getContract(): Contract {
    if (!contract) {
        throw new Error('Fabric connection not initialized');
    }
    return contract;
}

/**
 * Close the Fabric connection
 */
export function closeConnection(): void {
    if (gateway) {
        gateway.close();
        gateway = null;
        network = null;
        contract = null;
        isConnected = false;
    }
}

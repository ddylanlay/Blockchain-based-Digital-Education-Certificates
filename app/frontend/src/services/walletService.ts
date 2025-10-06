import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Credential {
    id: string;
    studentName: string;
    department: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    certificateType: string;
    issueDate: string;
    status: string;
    issuer: string;
    hash: string;
    signature: string;
  }

export class WalletService {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    async connectWallet() {
        console.log('🔄 WalletService: Starting connection...');

        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask not installed');
        }

        try {
          this.provider = new ethers.BrowserProvider(window.ethereum);
          await this.provider.send("eth_requestAccounts", []);
          this.signer = await this.provider.getSigner();
          const address = await this.signer.getAddress();
          console.log('✅ Wallet connected:', address);
          return address;
        } catch (error) {
          console.error('❌ Wallet connection failed:', error);
          throw new Error(`Connection failed: ${error}`);
        }
      }

    async signMessage(message: string) {
    if (!this.signer) throw new Error('Wallet not connected');
    return await this.signer.signMessage(message);
    }

    async getAddress() {
    if (!this.signer) throw new Error('Wallet not connected');
    return await this.signer.getAddress();
    }

    // store credential in wallet
    async storeCredential(credential: Credential) {
        if (!this.signer) throw new Error('Wallet not connected');

        try {
          // Create credential hash
          const credentialData = JSON.stringify(credential);
          const hash = ethers.keccak256(ethers.toUtf8Bytes(credentialData));

          // Sign the credential
          const signature = await this.signMessage(`Store credential: ${credential.id}`);

          // Store in localStorage (simulating wallet storage)
          const walletAddress = await this.getAddress();
          const storageKey = `credential_${walletAddress}_${credential.id}`;

          const storedCredential = {
            ...credential,
            hash,
            signature,
            storedAt: new Date().toISOString()
          };

          localStorage.setItem(storageKey, JSON.stringify(storedCredential));

          console.log('✅ Credential stored in wallet:', credential.id);
          return { hash, signature };
        } catch (error) {
          console.error('❌ Failed to store credential:', error);
          throw error;
        }
    }

    // get all credentials from wallet
    async getWalletCredentials(): Promise<Credential[]> {
        if (!this.signer) throw new Error('Wallet not connected');

        try {
          const walletAddress = await this.getAddress();
          const credentials: Credential[] = [];

          // Get all localStorage keys for this wallet
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(`credential_${walletAddress}_`)) {
              const stored = localStorage.getItem(key);
              if (stored) {
                const credential = JSON.parse(stored);
                credentials.push(credential);
              }
            }
          }

          console.log('✅ Retrieved credentials from wallet:', credentials.length);
          return credentials;
        } catch (error) {
          console.error('❌ Failed to get wallet credentials:', error);
          throw error;
        }
      }

    // verify credential authenticity
    async verifyCredential(credential: Credential): Promise<boolean> {
        try {
            // Verify signature
            const message = `Store credential: ${credential.id}`;
            const recoveredAddress = ethers.verifyMessage(message, credential.signature);
            const walletAddress = await this.getAddress();

            return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
        } catch (error) {
            console.error('❌ Credential verification failed:', error);
            return false;
        }
    }

    async checkConnection() {
        if (typeof window.ethereum === 'undefined') return false;
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          return accounts.length > 0;
        } catch (error) {
          return false;
        }
    }
}
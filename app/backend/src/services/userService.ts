import { User, VerifierAccount } from '../fabric/types';

// In-memory storage for demo purposes
// In production, this should be stored in a database
const users: Map<string, User> = new Map();
const verifierAccounts: Map<string, VerifierAccount> = new Map();

// Seed verifier account for testing
const SEED_VERIFIER: VerifierAccount = {
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example wallet address
  name: 'University Admin',
  email: 'admin@university.edu',
  university: 'Demo University',
  role: 'verifier',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Initialize with seed verifier account
verifierAccounts.set(SEED_VERIFIER.walletAddress.toLowerCase(), SEED_VERIFIER);

export class UserService {
  /**
   * Get user by wallet address
   */
  static getUserByWallet(walletAddress: string): User | null {
    return users.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Get verifier account by wallet address
   */
  static getVerifierByWallet(walletAddress: string): VerifierAccount | null {
    return verifierAccounts.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Check if wallet address is a verifier
   */
  static isVerifier(walletAddress: string): boolean {
    const verifier = this.getVerifierByWallet(walletAddress);
    return verifier !== null && verifier.isActive;
  }

  /**
   * Check if wallet address is an admin
   */
  static isAdmin(walletAddress: string): boolean {
    const user = this.getUserByWallet(walletAddress);
    return user !== null && user.role === 'admin' && user.isActive;
  }

  /**
   * Create a new verifier account
   */
  static createVerifierAccount(verifierData: Omit<VerifierAccount, 'createdAt'>): VerifierAccount {
    const verifier: VerifierAccount = {
      ...verifierData,
      createdAt: new Date().toISOString()
    };

    verifierAccounts.set(verifier.walletAddress.toLowerCase(), verifier);
    return verifier;
  }

  /**
   * Create a new user
   */
  static createUser(userData: Omit<User, 'createdAt'>): User {
    const user: User = {
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.set(user.walletAddress.toLowerCase(), user);
    return user;
  }

  /**
   * Get all verifier accounts
   */
  static getAllVerifiers(): VerifierAccount[] {
    return Array.from(verifierAccounts.values());
  }

  /**
   * Get all users
   */
  static getAllUsers(): User[] {
    return Array.from(users.values());
  }

  /**
   * Update user status
   */
  static updateUserStatus(walletAddress: string, isActive: boolean): boolean {
    const user = users.get(walletAddress.toLowerCase());
    if (user) {
      user.isActive = isActive;
      users.set(walletAddress.toLowerCase(), user);
      return true;
    }
    return false;
  }

  /**
   * Get seed verifier account info
   */
  static getSeedVerifierInfo(): { walletAddress: string; name: string; university: string } {
    return {
      walletAddress: SEED_VERIFIER.walletAddress,
      name: SEED_VERIFIER.name,
      university: SEED_VERIFIER.university
    };
  }
}

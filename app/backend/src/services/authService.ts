import { ethers } from 'ethers';
import { UserService } from './userService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}

export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export class AuthService {
  /**
   * Authenticate verifier with wallet signature
   */
  static async authenticateVerifier(loginData: LoginRequest): Promise<AuthResult> {
    try {
      const { walletAddress, signature, message } = loginData;

      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return {
          success: false,
          error: 'Invalid wallet signature'
        };
      }

      // Check if user is a verifier
      const verifier = UserService.getVerifierByWallet(walletAddress);

      if (!verifier) {
        return {
          success: false,
          error: 'Wallet address not registered as verifier'
        };
      }

      if (!verifier.isActive) {
        return {
          success: false,
          error: 'Verifier account is deactivated'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          walletAddress: verifier.walletAddress,
          role: verifier.role,
          university: verifier.university,
          name: verifier.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: {
          walletAddress: verifier.walletAddress,
          name: verifier.name,
          email: verifier.email,
          university: verifier.university,
          role: verifier.role,
          isActive: verifier.isActive
        }
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate authentication message for signing
   */
  static generateAuthMessage(walletAddress: string): string {
    const timestamp = Date.now();
    return `Login to Education Credential System\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
  }
}

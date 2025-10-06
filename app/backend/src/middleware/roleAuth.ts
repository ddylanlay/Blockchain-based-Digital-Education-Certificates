import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

// Extend Request interface to include user role
declare global {
  namespace Express {
    interface Request {
      userRole?: string;
      isVerifier?: boolean;
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware to verify that the user is a verifier (can issue credentials)
 */
export const requireVerifier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletAddress = req.walletAddress;

    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet address not found in request'
      });
    }

    const isVerifier = UserService.isVerifier(walletAddress);

    if (!isVerifier) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only verifier accounts can issue credentials',
        details: {
          walletAddress,
          requiredRole: 'verifier',
          message: 'Contact your university administrator to get verifier access'
        }
      });
    }

    // Add role info to request for logging
    req.isVerifier = true;
    req.userRole = 'verifier';

    next();
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

/**
 * Middleware to verify that the user is an admin
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletAddress = req.walletAddress;

    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet address not found in request'
      });
    }

    const isAdmin = UserService.isAdmin(walletAddress);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin access required',
        details: {
          walletAddress,
          requiredRole: 'admin'
        }
      });
    }

    req.isAdmin = true;
    req.userRole = 'admin';

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin verification failed'
    });
  }
};

/**
 * Middleware to verify that the user is either verifier or admin
 */
export const requireVerifierOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletAddress = req.walletAddress;

    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet address not found in request'
      });
    }

    const isVerifier = UserService.isVerifier(walletAddress);
    const isAdmin = UserService.isAdmin(walletAddress);

    if (!isVerifier && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Verifier or admin access required',
        details: {
          walletAddress,
          requiredRoles: ['verifier', 'admin']
        }
      });
    }

    req.isVerifier = isVerifier;
    req.isAdmin = isAdmin;
    req.userRole = isAdmin ? 'admin' : 'verifier';

    next();
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

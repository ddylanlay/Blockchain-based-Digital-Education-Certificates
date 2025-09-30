import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      walletAddress?: string;
      userRole?: string;
    }
  }
}

/**
 * JWT Authentication middleware
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Add user info to request
    req.user = decoded;
    req.walletAddress = decoded.walletAddress;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};

/**
 * Middleware to verify verifier role with JWT
 */
export const requireVerifierJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.userRole !== 'verifier') {
      return res.status(403).json({
        success: false,
        error: 'Verifier access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

/**
 * Middleware to verify admin role with JWT
 */
export const requireAdminJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

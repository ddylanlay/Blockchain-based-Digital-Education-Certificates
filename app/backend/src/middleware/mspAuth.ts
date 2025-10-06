import { Request, Response, NextFunction } from 'express';
import { MSPService } from '../services/mspService';

declare global {
  namespace Express {
    interface Request {
      mspUser?: any;
      userRole?: string;
      mspId?: string;
    }
  }
}

/**
 * MSP Authentication middleware
 * This replaces the wallet-based authentication with MSP-based authentication
 */
export const authenticateMSP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (!role || (role !== 'CA_ADMIN' && role !== 'STUDENT')) {
      return res.status(400).json({
        success: false,
        error: 'Valid role (CA_ADMIN or STUDENT) is required'
      });
    }

    // Authenticate using MSP
    const authResult = await MSPService.authenticateUser({ role });

    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        success: false,
        error: authResult.error || 'MSP authentication failed'
      });
    }

    // Add user info to request
    req.mspUser = authResult.user;
    req.userRole = authResult.user.role;
    req.mspId = authResult.user.mspId;

    next();
  } catch (error) {
    console.error('MSP authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'MSP authentication failed'
    });
  }
};

/**
 * Middleware to verify that the user is a CA admin
 */
export const requireCAAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.mspUser) {
      return res.status(401).json({
        success: false,
        error: 'MSP authentication required'
      });
    }

    if (req.mspUser.role !== 'CA_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: CA administrator access required',
        details: {
          userRole: req.mspUser.role,
          requiredRole: 'CA_ADMIN',
          message: 'Only university administrators can perform this action'
        }
      });
    }

    next();
  } catch (error) {
    console.error('CA admin verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

/**
 * Middleware to verify that the user is a student
 */
export const requireStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.mspUser) {
      return res.status(401).json({
        success: false,
        error: 'MSP authentication required'
      });
    }

    if (req.mspUser.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Student access required',
        details: {
          userRole: req.mspUser.role,
          requiredRole: 'STUDENT',
          message: 'Only students can perform this action'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Student verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

/**
 * Middleware to verify that the user is either CA admin or student
 */
export const requireCAAdminOrStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.mspUser) {
      return res.status(401).json({
        success: false,
        error: 'MSP authentication required'
      });
    }

    if (req.mspUser.role !== 'CA_ADMIN' && req.mspUser.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Valid user role required',
        details: {
          userRole: req.mspUser.role,
          requiredRoles: ['CA_ADMIN', 'STUDENT']
        }
      });
    }

    next();
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Role verification failed'
    });
  }
};

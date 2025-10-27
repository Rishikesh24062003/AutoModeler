import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

/**
 * Extend Express Request type to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Interface for model definition structure
 */
interface ModelDefinition {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    default?: any;
  }>;
  rbac: {
    [role: string]: string[];
  };
  ownerField?: string; // Optional field to identify record owner (e.g., "userId", "ownerId")
}

/**
 * Higher-order function that creates RBAC middleware for a specific model
 * 
 * @param modelDefinition - The model definition containing RBAC configuration
 * @returns Express middleware function
 */
export function checkPermissions(modelDefinition: ModelDefinition) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract and verify JWT token
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized: No token provided',
          message: 'Please provide a valid Bearer token in the Authorization header',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET is not configured');
        return res.status(500).json({
          error: 'Server configuration error',
        });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Unauthorized: Invalid token',
          });
        }
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Unauthorized: Token expired',
          });
        }
        throw error;
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      // 2. Determine required action from HTTP method
      const methodToAction: { [key: string]: string } = {
        GET: 'read',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };

      const requiredAction = methodToAction[req.method];

      if (!requiredAction) {
        return res.status(405).json({
          error: 'Method not allowed',
        });
      }

      // 3. Check if user's role has permission for this action
      const userRole = req.user.role;
      const allowedActions = modelDefinition.rbac[userRole];

      if (!allowedActions) {
        return res.status(403).json({
          error: 'Forbidden: Your role does not have any permissions for this resource',
          role: userRole,
        });
      }

      // Check if role has "all" permissions or the specific action
      const hasPermission =
        allowedActions.includes('all') ||
        allowedActions.includes(requiredAction);

      if (!hasPermission) {
        return res.status(403).json({
          error: `Forbidden: Your role (${userRole}) does not have permission to ${requiredAction} this resource`,
          allowedActions,
        });
      }

      // 4. Ownership check for UPDATE and DELETE operations (non-ADMIN users only)
      if ((req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') && userRole !== 'ADMIN') {
        const recordId = req.params.id;

        if (!recordId) {
          return res.status(400).json({
            error: 'Bad request: Record ID is required',
          });
        }

        // Convert to number
        const numericId = parseInt(recordId, 10);
        if (isNaN(numericId)) {
          return res.status(400).json({
            error: 'Bad request: Invalid record ID format',
          });
        }

        // Fetch the record to check ownership
        const modelName = modelDefinition.name.toLowerCase();
        const record = await (prisma as any)[modelName].findUnique({
          where: { id: numericId },
        });

        if (!record) {
          return res.status(404).json({
            error: `${modelDefinition.name} with id ${recordId} not found`,
          });
        }

        // Determine the owner field
        // Default owner fields to check: userId, ownerId, createdBy
        const ownerField = modelDefinition.ownerField || 'userId';
        const recordOwnerId = record[ownerField];

        // If the model has an owner field, enforce ownership check
        if (recordOwnerId !== undefined) {
          if (recordOwnerId !== req.user.id) {
            return res.status(403).json({
              error: 'Forbidden: You can only modify your own records',
              message: `This ${modelDefinition.name} belongs to another user`,
            });
          }
          console.log(`✅ Ownership verified: User ${req.user.id} owns record ${recordId}`);
        } else {
          // If no owner field exists, log a warning but allow the operation
          console.warn(`⚠️  No owner field (${ownerField}) found on ${modelDefinition.name} model`);
        }
      }

      // 5. All checks passed - proceed to next middleware/handler
      console.log(`✅ Permission granted: ${userRole} can ${requiredAction} ${modelDefinition.name}`);
      next();

    } catch (error: any) {
      console.error('Error in RBAC middleware:', error);
      return res.status(500).json({
        error: 'Internal server error during authorization',
        details: error.message,
      });
    }
  };
}

/**
 * Simple authentication middleware (just verifies JWT, no RBAC)
 * Useful for routes that need authentication but not model-specific permissions
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: No token provided',
      });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return res.status(500).json({
        error: 'Server configuration error',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired token',
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

export default { checkPermissions, requireAuth };

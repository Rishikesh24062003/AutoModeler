import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import type { Role } from '@prisma/client';

const router = Router();

// Middleware to check if user is super admin
const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@platform.com';
  
  if (user.email !== superAdminEmail) {
    return res.status(403).json({ 
      error: 'Forbidden: Only super admin can access this resource' 
    });
  }

  next();
};

// GET /api/users - List all users (Super Admin only)
router.get('/', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        // Don't send password
      },
      orderBy: {
        id: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/role - Update user role (Super Admin only)
router.put('/:id/role', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be ADMIN, MANAGER, or VIEWER' 
      });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing super admin's role
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@platform.com';
    if (user.email === superAdminEmail) {
      return res.status(403).json({ 
        error: 'Cannot change super admin role' 
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// DELETE /api/users/:id - Delete user (Super Admin only)
router.delete('/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@platform.com';
    if (user.email === superAdminEmail) {
      return res.status(403).json({ 
        error: 'Cannot delete super admin account' 
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

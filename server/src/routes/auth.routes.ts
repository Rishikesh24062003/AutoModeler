import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   role?: 'ADMIN' | 'MANAGER' | 'VIEWER'
 * }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        error: 'Email is required and must be a string' 
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ 
        error: 'Password is required and must be a string' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validate role if provided
    const validRoles = ['ADMIN', 'MANAGER', 'VIEWER'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'VIEWER', // Default to VIEWER if not specified
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ New user registered: ${email} (${user.role})`);

    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      error: 'Internal server error during registration',
      details: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Login and get JWT token
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        error: 'Email is required and must be a string' 
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ 
        error: 'Password is required and must be a string' 
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Compare password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    console.log(`✅ User logged in: ${email} (${user.role})`);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({
      error: 'Internal server error during login',
      details: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information (requires valid JWT)
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    return res.json({ user });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }
    console.error('Error fetching user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

export default router;

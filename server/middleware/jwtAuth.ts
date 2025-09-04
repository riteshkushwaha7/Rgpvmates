import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT Authentication Middleware - Like Big Websites
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 JWT Auth - No Bearer token found');
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 JWT Auth - Token received, length:', token.length);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('🔍 JWT Auth - Token decoded, user ID:', decoded.userId);

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (userResult.length === 0) {
      console.log('❌ JWT Auth - User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Check if user is approved
    if (!user.isApproved) {
      console.log('❌ JWT Auth - User not approved');
      return res.status(403).json({ error: 'Account pending approval' });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      console.log('❌ JWT Auth - User suspended');
      return res.status(403).json({ error: 'Account suspended' });
    }

    console.log('✅ JWT Auth - User authenticated:', { id: user.id, email: user.email });
    
    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('JWT Auth error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional JWT Auth - doesn't fail if no token, but attaches user if available
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const userResult = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (userResult.length > 0) {
      req.user = userResult[0];
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Generate JWT token
export const generateToken = (userId: string, email: string) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' } // 30 days - like big websites
  );
};

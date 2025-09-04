import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
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

// Header-based authentication middleware - reliable for production
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = null;

    // Get credentials from headers
    const userEmail = req.headers['x-user-email'] as string;
    const userPassword = req.headers['x-user-password'] as string;

    if (userEmail && userPassword) {
      console.log('🔍 Auth middleware - Header authentication check:', { 
        userEmail: userEmail ? 'Provided' : 'Missing',
        userPassword: userPassword ? 'Provided' : 'Missing'
      });

      const headerUser = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
      if (headerUser.length > 0) {
        const isValidPassword = await bcrypt.compare(userPassword, headerUser[0].password);
        if (isValidPassword) {
          user = headerUser[0];
          console.log('✅ Auth middleware passed - Header credentials verified');
        } else {
          console.log('❌ Auth middleware - Invalid password for user:', userEmail);
        }
      } else {
        console.log('❌ Auth middleware - User not found:', userEmail);
      }
    } else {
      console.log('🔍 Auth middleware - Missing credentials in headers:', {
        userEmail: !!userEmail,
        userPassword: !!userPassword
      });
    }

    // If no authentication method worked
    if (!user) {
      console.log('❌ Auth middleware failed - No valid authentication');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      console.log('❌ Auth middleware failed - User not approved');
      return res.status(403).json({ error: 'Account pending approval' });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional auth middleware - header-based only
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = null;

    // Try header-based authentication
    const userEmail = req.headers['x-user-email'] as string;
    const userPassword = req.headers['x-user-password'] as string;

    if (userEmail && userPassword) {
      const headerUser = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
      if (headerUser.length > 0) {
        const isValidPassword = await bcrypt.compare(userPassword, headerUser[0].password);
        if (isValidPassword) {
          user = headerUser[0];
        }
      }
    }

    // Attach user to request (can be null)
    req.user = user;
    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

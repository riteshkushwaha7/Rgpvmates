import { Request, Response, NextFunction } from 'express';
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

// SIMPLE USER ID BASED AUTHENTICATION - NO SESSIONS, NO PASSWORDS
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from headers
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!userId || !userEmail) {
      console.log('🔍 Auth middleware - Missing user ID or email:', { 
        userId: !!userId, 
        userEmail: !!userEmail 
      });
      return res.status(401).json({ error: 'User ID and email required' });
    }

    console.log('🔍 Auth middleware - Validating user:', { userId, userEmail });

    // Get user from database by ID
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userResult.length === 0) {
      console.log('❌ Auth middleware - User not found in database:', userId);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Verify email matches
    if (user.email !== userEmail) {
      console.log('❌ Auth middleware - Email mismatch:', { 
        provided: userEmail, 
        stored: user.email 
      });
      return res.status(401).json({ error: 'Invalid user credentials' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      console.log('❌ Auth middleware failed - User not approved');
      return res.status(403).json({ error: 'Account pending approval' });
    }

    console.log('✅ Auth middleware passed - User validated:', { userId, email: user.email });
    
    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional auth middleware - user ID based only
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = null;

    // Try user ID based authentication
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (userId && userEmail) {
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userResult.length > 0) {
        const dbUser = userResult[0];
        if (dbUser.email === userEmail) {
          user = dbUser;
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

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

// Hybrid authentication middleware - prioritizes header-based auth in production
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = null;
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, prioritize header-based authentication (more reliable)
    if (isProduction) {
      const userEmail = req.headers['x-user-email'] as string;
      const userPassword = req.headers['x-user-password'] as string;

      if (userEmail && userPassword) {
        console.log('🔍 Auth middleware - Production header check:', { 
          userEmail: userEmail ? 'Provided' : 'Missing',
          userPassword: userPassword ? 'Provided' : 'Missing'
        });

        const headerUser = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
        if (headerUser.length > 0) {
          const isValidPassword = await bcrypt.compare(userPassword, headerUser[0].password);
          if (isValidPassword) {
            user = headerUser[0];
            console.log('✅ Auth middleware passed - Production header credentials verified');
          }
        }
      }
    }

    // If header auth failed or in development, try session-based authentication
    if (!user) {
      if (req.session && req.session.userId) {
        console.log('🔍 Auth middleware - Session check:', { 
          userId: req.session.userId,
          email: req.session.email,
          sessionId: req.sessionID,
          sessionKeys: Object.keys(req.session)
        });

        const sessionUser = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
        if (sessionUser.length > 0) {
          user = sessionUser[0];
          console.log('✅ Auth middleware passed - Session verified');
        } else {
          console.log('❌ Auth middleware - User not found in database for session userId:', req.session.userId);
        }
      } else {
        console.log('🔍 Auth middleware - No session found:', {
          hasSession: !!req.session,
          sessionId: req.sessionID,
          sessionKeys: req.session ? Object.keys(req.session) : 'No session'
        });
      }

      // If session auth failed, try header-based authentication as fallback
      if (!user) {
        const userEmail = req.headers['x-user-email'] as string;
        const userPassword = req.headers['x-user-password'] as string;

        if (userEmail && userPassword) {
          console.log('🔍 Auth middleware - Fallback header check:', { 
            userEmail: userEmail ? 'Provided' : 'Missing',
            userPassword: userPassword ? 'Provided' : 'Missing'
          });

          const headerUser = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
          if (headerUser.length > 0) {
            const isValidPassword = await bcrypt.compare(userPassword, headerUser[0].password);
            if (isValidPassword) {
              user = headerUser[0];
              console.log('✅ Auth middleware passed - Fallback header credentials verified');
            }
          }
        }
      }
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

// Optional auth middleware - doesn't fail if no auth, but attaches user if available
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = null;

    // Try session-based authentication
    if (req.session && req.session.userId) {
      const sessionUser = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
      if (sessionUser.length > 0) {
        user = sessionUser[0];
      }
    }

    // Try header-based authentication
    if (!user) {
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

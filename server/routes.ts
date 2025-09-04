import { Router } from 'express';
import { authRoutes } from './auth.js';
import { profileRoutes } from './profiles.js';
import { discoverRoutes } from './discover.js';
import { matchingRoutes } from './matching.js';
import { paymentRoutes } from './payment.js';
import { adminRoutes } from './admin.js';
import { contactRoutes } from './contact.js';
import { messageRoutes } from './messages.js';
import { uploadRoutes } from './upload.js';
import { collegeRoutes } from './colleges.js';
import { branchRoutes } from './branches.js';
import { db } from './db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';


const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database health check
router.get('/db-health', async (req, res) => {
  try {
    // Test database connection
    const result = await db.execute('SELECT 1 as test');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Failed',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Simple test endpoint to verify server is working
router.get('/test', async (req, res) => {
  try {
    const { users } = await import('./shared/schema.js');
    const userCount = await db.select().from(users);
    
    res.json({
      message: 'Server is working!',
      database: 'Connected',
      userCount: userCount.length,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set'
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      message: 'Server has errors',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// NO SESSION TEST - Using localStorage + user ID validation
router.get('/auth-status', (req, res) => {
  res.json({ 
    message: 'Authentication system active',
    method: 'localStorage + user ID validation',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/discover', discoverRoutes);
router.use('/matching', matchingRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);
router.use('/colleges', collegeRoutes);
router.use('/branches', branchRoutes);

// User authentication check - NO AUTH REQUIRED FOR NOW
router.get('/me', async (req, res) => {
  try {
    // Try to get user from headers if available
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    
    if (userId && userEmail) {
      // Get full user data from database
      const userResult = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        age: users.age,
        gender: users.gender,
        college: users.college,
        branch: users.branch,
        graduationYear: users.graduationYear,
        profileImageUrl: users.profileImageUrl,
        isApproved: users.isApproved,
        isAdmin: users.isAdmin,
        paymentDone: users.paymentDone,
        likedUsers: users.likedUsers,
        dislikedUsers: users.dislikedUsers,
        blockedUsers: users.blockedUsers,
      }).from(users).where(eq(users.id, userId)).limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: userResult[0] });
    } else {
      // Return a default response for now
      res.json({ message: 'No user ID provided' });
    }
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile - NO AUTH REQUIRED FOR NOW
router.put('/me', async (req, res) => {
  try {
    const { age, college, branch, graduationYear, bio } = req.body;
    
    // For now, just return success
    res.json({ message: 'Profile update endpoint - auth not implemented yet' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Logout - just return success since we're not using sessions
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export { router as routes };

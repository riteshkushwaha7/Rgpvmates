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
import { requireAuth } from './middleware/jwtAuth.js';

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

// User authentication check - WITH JWT AUTHENTICATION
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('🔍 /me endpoint - User authenticated:', { id: user.id, email: user.email });
    
    // Return the authenticated user data
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        profileImageUrl: user.profileImageUrl,
        isApproved: user.isApproved,
        isAdmin: user.isAdmin,
        paymentDone: user.paymentDone,
        likedUsers: user.likedUsers,
        dislikedUsers: user.dislikedUsers,
        blockedUsers: user.blockedUsers,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('/me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile - WITH JWT AUTHENTICATION
router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { age, college, branch, graduationYear, bio } = req.body;
    
    console.log('🔍 /me (PUT) endpoint - User authenticated:', { id: user.id, email: user.email });
    
    // For now, just return success (profile update logic can be implemented later)
    res.json({ message: 'Profile update endpoint - authentication working, update logic pending' });
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

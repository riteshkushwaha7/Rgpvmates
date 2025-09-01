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

// Session test endpoint
router.get('/session-test', (req, res) => {
  // Test setting a session value
  if (!req.session.testValue) {
    req.session.testValue = 'Test_' + Date.now();
    console.log('🔧 Set test session value:', req.session.testValue);
  }
  
  // Force save to test persistence
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return res.status(500).json({ error: 'Session save failed', details: err.message });
    }
    
    console.log('✅ Session saved successfully');
    
    res.json({
      sessionId: req.sessionID,
      sessionData: {
        userId: req.session.userId,
        email: req.session.email,
        isAdmin: req.session.isAdmin,
        testValue: req.session.testValue
      },
      sessionKeys: Object.keys(req.session),
      timestamp: new Date().toISOString(),
      message: 'Session test completed'
    });
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

// User session check
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
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
    }).from(users).where(eq(users.id, req.session.userId)).limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult[0] });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const { age, college, branch, graduationYear, bio } = req.body;
    
    // Update user data
    const updateData: any = {};
    if (age !== undefined) updateData.age = age;
    if (college !== undefined) updateData.college = college;
    if (branch !== undefined) updateData.branch = branch;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    
    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, req.session.userId));
    }
    
    // Get updated user data
    const updatedUser = await db.select({
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
    }).from(users).where(eq(users.id, req.session.userId)).limit(1);
    
    res.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export { router as routes };

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

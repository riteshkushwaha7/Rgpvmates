import { Router } from 'express';
import { db } from './db.js';
import { users, profiles, contactSubmissions, reports } from './shared/schema.js';
import { eq, and, desc, count, not } from 'drizzle-orm';

const router = Router();

// Admin login endpoint (no middleware required)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔍 Admin login attempt:', { username, password });
    console.log('🔍 Environment variables:', { 
      ADMIN_USERNAME: process.env.ADMIN_USERNAME, 
      ADMIN_PWD: process.env.ADMIN_PWD 
    });

    // Check if username matches ADMIN_USERNAME from environment
    if (username !== process.env.ADMIN_USERNAME) {
      console.log('❌ Username mismatch:', { provided: username, expected: process.env.ADMIN_USERNAME });
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Check if password matches ADMIN_PWD from environment
    if (password !== process.env.ADMIN_PWD) {
      console.log('❌ Password mismatch:', { provided: password, expected: process.env.ADMIN_PWD });
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Set admin session directly (no database user needed)
    req.session.userId = 'ADMIN_' + Date.now();
    req.session.email = username;
    req.session.isAdmin = true;
    
    console.log('🔐 Admin login - Session set:', {
      userId: req.session.userId,
      email: req.session.email,
      isAdmin: req.session.isAdmin,
      sessionId: req.sessionID
    });

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('✅ Session saved successfully');
      
      res.json({
        message: 'Admin login successful',
        user: {
          id: req.session.userId,
          email: req.session.email,
          firstName: 'Admin',
          lastName: 'User',
          isApproved: true,
          isAdmin: true,
          paymentDone: true
        }
      });
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  console.log('🔍 Admin middleware - Session data:', {
    userId: req.session.userId,
    email: req.session.email,
    isAdmin: req.session.isAdmin
  });
  
  // Simple admin check - just verify session
  if (req.session.userId && req.session.isAdmin === true) {
    console.log('✅ Admin middleware passed - Session verified');
    return next();
  }
  
  console.log('❌ Admin middleware failed - Not admin');
  return res.status(403).json({ error: 'Admin access required' });
};

// Admin session check endpoint (no middleware required)
router.get('/check-session', (req, res) => {
  console.log('🔍 Admin session check - Full session data:', {
    userId: req.session.userId,
    isAdmin: req.session.isAdmin,
    email: req.session.email,
    sessionKeys: Object.keys(req.session)
  });
  
  if (!req.session.userId || !req.session.isAdmin) {
    console.log('❌ Admin session check failed - Invalid session');
    return res.status(401).json({ error: 'Admin session invalid' });
  }
  
  console.log('✅ Admin session check passed - Session valid');
  res.json({
    user: {
      id: req.session.userId,
      email: req.session.email,
      firstName: 'Admin',
      lastName: 'User',
      isApproved: true,
      isAdmin: true,
      paymentDone: true
    }
  });
});

// Admin logout endpoint (no middleware required)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Admin logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log('✅ Admin logged out successfully');
    res.json({ message: 'Admin logged out successfully' });
  });
});

// Test endpoint to verify admin routes are working (no middleware required)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'Set' : 'Not Set',
      ADMIN_PWD: process.env.ADMIN_PWD ? 'Set' : 'Not Set'
    }
  });
});

// Simple session test endpoint (no middleware required)
router.get('/session-test', (req, res) => {
  // Set a test admin session
  req.session.userId = 'TEST_ADMIN_' + Date.now();
  req.session.email = 'test@admin.com';
  req.session.isAdmin = true;
  
  console.log('🔧 Test admin session set:', {
    userId: req.session.userId,
    email: req.session.email,
    isAdmin: req.session.isAdmin
  });
  
  // Force save
  req.session.save((err) => {
    if (err) {
      console.error('❌ Test session save error:', err);
      return res.status(500).json({ error: 'Test session save failed' });
    }
    
    console.log('✅ Test admin session saved');
    
    res.json({
      message: 'Test admin session created',
      sessionId: req.sessionID,
      sessionData: {
        userId: req.session.userId,
        email: req.session.email,
        isAdmin: req.session.isAdmin
      },
      timestamp: new Date().toISOString()
    });
  });
});

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total registrations (all users)
    const totalRegistrations = await db.select().from(users);
    
    // Get new registrations pending ID verification (not approved)
    const pendingVerification = await db.select().from(users).where(
      eq(users.isApproved, false)
    );
    
    // Get active users (approved and not suspended)
    const activeUsers = await db.select().from(users).where(
      and(eq(users.isApproved, true), eq(users.isSuspended, false))
    );
    
    // Get suspended users
    const suspendedUsers = await db.select().from(users).where(
      eq(users.isSuspended, true)
    );
    
    // Get premium users (payment done)
    const premiumUsers = await db.select().from(users).where(
      eq(users.paymentDone, true)
    );
    
    // Calculate total earnings (₹99 per premium user)
    const totalEarnings = premiumUsers.length * 99;

    res.json({
      totalRegistrations: totalRegistrations.length,
      pendingVerification: pendingVerification.length,
      activeUsers: activeUsers.length,
      suspendedUsers: suspendedUsers.length,
      premiumUsers: premiumUsers.length,
      totalEarnings: totalEarnings,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
});

// Get pending user approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const pendingUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      age: users.age,
      gender: users.gender, // Added gender
      college: users.college,
      branch: users.branch,
      graduationYear: users.graduationYear,
      phone: users.phone,
      profileImageUrl: users.profileImageUrl,
      idCardFront: users.idCardFront,
      idCardBack: users.idCardBack,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.isApproved, false))
    .orderBy(desc(users.createdAt));

    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to get pending approvals' });
  }
});

// Approve/reject user
router.put('/approve/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { approved } = req.body;

    await db.update(users)
      .set({
        isApproved: approved,
        // Automatically bypass payment when approving users
        paymentDone: approved ? true : false,
        premiumBypassed: approved ? true : false,
        paymentId: approved ? 'BYPASS' : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({ message: `User ${approved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Suspend/unsuspend user
router.put('/suspend/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspended } = req.body;

    await db.update(users)
      .set({
        isSuspended: suspended,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({ message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully` });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db.select({
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
      isSuspended: users.isSuspended,
      paymentDone: users.paymentDone,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get contact form submissions
router.get('/contact-submissions', async (req, res) => {
  try {
    const submissions = await db.select().from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));

    res.json(submissions);
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Failed to get contact submissions' });
  }
});

// Mark contact submission as resolved
router.put('/contact-submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved } = req.body;

    await db.update(contactSubmissions)
      .set({
        isResolved,
        updatedAt: new Date(),
      })
      .where(eq(contactSubmissions.id, id));

    res.json({ message: 'Contact submission updated successfully' });
  } catch (error) {
    console.error('Update contact submission error:', error);
    res.status(500).json({ error: 'Failed to update contact submission' });
  }
});

// Get user reports
router.get('/reports', async (req, res) => {
  try {
    const userReports = await db.select({
      id: reports.id,
      reason: reports.reason,
      description: reports.description,
      isResolved: reports.isResolved,
      createdAt: reports.createdAt,
      reporterId: reports.reporterId,
      reportedId: reports.reportedId,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt));

    res.json(userReports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Mark report as resolved
router.put('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved } = req.body;

    await db.update(reports)
      .set({
        isResolved,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));

    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete user and all associated data
router.delete('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user and all associated data in a transaction
    await db.transaction(async (tx) => {
      // Delete user reports (as reporter)
      await tx.delete(reports).where(eq(reports.reporterId, userId));
      
      // Delete user reports (as reported)
      await tx.delete(reports).where(eq(reports.reportedId, userId));
      
      // Delete user profile
      await tx.delete(profiles).where(eq(profiles.userId, userId));
      
      // Delete user (this will cascade to other related data)
      await tx.delete(users).where(eq(users.id, userId));
    });

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export { router as adminRoutes };

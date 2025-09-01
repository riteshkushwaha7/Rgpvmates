import { Router } from 'express';
import { db } from './db.js';
import { users, profiles, contactSubmissions, reports } from './shared/schema.js';
import { eq, and, desc, count, not } from 'drizzle-orm';

const router = Router();

// Admin login endpoint (no middleware required)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username matches ADMIN_USERNAME from environment
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Check if password matches ADMIN_PWD from environment
    if (password !== process.env.ADMIN_PWD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Find or create admin user
    const adminEmail = `${process.env.ADMIN_USERNAME}@rgpv-mates.com`;
    let adminUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (adminUser.length === 0) {
      // Create admin user if it doesn't exist
      const [newAdmin] = await db.insert(users).values({
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        age: 25,
        gender: 'male',
        college: 'University Institute of Technology (UIT)',
        branch: 'Computer Science & Engineering',
        graduationYear: '2024',
        password: 'admin_password_hash', // This won't be used for admin login
        isApproved: true,
        isAdmin: true,
        paymentDone: true,
        premiumBypassed: true,
        paymentId: 'ADMIN_BYPASS'
      }).returning();
      adminUser = [newAdmin];
    }

    // Set admin session
    req.session.userId = adminUser[0].id;
    req.session.email = adminUser[0].email;
    req.session.isAdmin = true;
    
    console.log('🔐 Admin login - Session set:', {
      userId: req.session.userId,
      email: req.session.email,
      isAdmin: req.session.isAdmin,
      expectedEmail: `${process.env.ADMIN_USERNAME}@rgpv-mates.com`
    });

    res.json({
      message: 'Admin login successful',
      user: {
        id: adminUser[0].id,
        email: adminUser[0].email,
        firstName: adminUser[0].firstName,
        lastName: adminUser[0].lastName,
        isApproved: adminUser[0].isApproved,
        isAdmin: adminUser[0].isAdmin,
        paymentDone: adminUser[0].paymentDone
      }
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
    isAdmin: req.session.isAdmin,
    expectedEmail: `${process.env.ADMIN_USERNAME}@rgpv-mates.com`,
    envUsername: process.env.ADMIN_USERNAME
  });
  
  // Check if admin session exists
  if (!req.session.userId || !req.session.isAdmin) {
    console.log('❌ Admin middleware failed - Missing session data');
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // For admin, we don't need to check database - just verify session
  const adminEmail = `${process.env.ADMIN_USERNAME}@rgpv-mates.com`;
  if (req.session.email === adminEmail && req.session.isAdmin === true) {
    console.log('✅ Admin middleware passed - Session verified');
    return next();
  }
  
  console.log('❌ Admin middleware failed - Email mismatch or not admin');
  return res.status(403).json({ error: 'Admin access required' });
};

// Admin session check endpoint (no middleware required)
router.get('/check-session', (req, res) => {
  console.log('🔍 Admin session check - Full session data:', {
    userId: req.session.userId,
    isAdmin: req.session.isAdmin,
    email: req.session.email,
    expectedEmail: `${process.env.ADMIN_USERNAME}@rgpv-mates.com`,
    envUsername: process.env.ADMIN_USERNAME,
    sessionKeys: Object.keys(req.session)
  });
  
  const adminEmail = `${process.env.ADMIN_USERNAME}@rgpv-mates.com`;
  if (!req.session.userId || !req.session.isAdmin || req.session.email !== adminEmail) {
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

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total registrations (all users except admin)
    const adminEmail = `${process.env.ADMIN_USERNAME}@rgpv-mates.com`;
    const totalRegistrations = await db.select().from(users).where(not(eq(users.email, adminEmail)));
    
    // Get new registrations pending ID verification (not approved, except admin)
    const pendingVerification = await db.select().from(users).where(
      and(eq(users.isApproved, false), not(eq(users.email, adminEmail)))
    );
    
    // Get active users (approved and not suspended, except admin)
    const activeUsers = await db.select().from(users).where(
      and(eq(users.isApproved, true), eq(users.isSuspended, false), not(eq(users.email, adminEmail)))
    );
    
    // Get suspended users (except admin)
    const suspendedUsers = await db.select().from(users).where(
      and(eq(users.isSuspended, true), not(eq(users.email, adminEmail)))
    );
    
    // Get premium users (payment done, except admin)
    const premiumUsers = await db.select().from(users).where(
      and(eq(users.paymentDone, true), not(eq(users.email, adminEmail)))
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

// Get all users (excluding admin user)
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      age: users.age,
      gender: users.gender, // Added gender
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
    .where(not(eq(users.email, `${process.env.ADMIN_USERNAME}@rgpv-mates.com`))) // Exclude admin user
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

import { Router } from 'express';
import { db } from './db.js';
import { profiles, users } from './shared/schema.js';
import { eq, and, not, inArray } from 'drizzle-orm';

const router = Router();

// Get discoverable profiles - NO AUTH REQUIRED FOR NOW
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Discover endpoint - No auth required, returning all profiles');
    
    // Get all approved users with profile information
    const allProfiles = await db
      .select({
        id: users.id,
        userId: users.id,
        age: users.age,
        gender: users.gender,
        branch: users.branch,
        graduationYear: users.graduationYear,
        profileImageUrl: users.profileImageUrl,
        // User info
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userCollege: users.college,
        createdAt: users.createdAt,
        // Profile info from profiles table
        bio: profiles.bio,
        profilePicture: profiles.profilePicture,
        photos: profiles.photos,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(users.isApproved, true),
          eq(users.isSuspended, false)
        )
      )
      .orderBy(users.createdAt)
      .limit(10);

    console.log('🔍 Discover endpoint - Found profiles:', allProfiles.length);
    console.log('🔍 Discover endpoint - First profile:', allProfiles[0] || 'No profiles found');

    res.json(allProfiles);
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to get discoverable profiles' });
  }
});

// Debug endpoint to get all users without filtering - NO AUTH REQUIRED
router.get('/debug-all-users', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint - No auth required, returning all users');

    // Get all users without any filtering
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        age: users.age,
        gender: users.gender,
        isApproved: users.isApproved,
        isSuspended: users.isSuspended,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    console.log('🔍 Debug endpoint - Total users found:', allUsers.length);
    console.log('🔍 Debug endpoint - Sample users:', allUsers.slice(0, 5));

    res.json({
      message: 'Debug endpoint - All users in database',
      totalUsers: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
});

// Get next profile for swiping - NO AUTH REQUIRED FOR NOW
router.get('/next', async (req, res) => {
  try {
    console.log('🔍 Next profile endpoint - No auth required, returning first profile');

    // Get first approved user with profile information
    const nextUser = await db
      .select({
        id: users.id,
        userId: users.id,
        age: users.age,
        gender: users.gender,
        branch: users.branch,
        graduationYear: users.graduationYear,
        profileImageUrl: users.profileImageUrl,
        // User info
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userCollege: users.college,
        createdAt: users.createdAt,
        // Profile info from profiles table
        bio: profiles.bio,
        profilePicture: profiles.profilePicture,
        photos: profiles.photos,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(users.isApproved, true),
          eq(users.isSuspended, false)
        )
      )
      .orderBy(users.createdAt)
      .limit(1);

    console.log('🔍 Next profile endpoint - Found user:', nextUser.length > 0 ? 'Yes' : 'No');

    if (nextUser.length === 0) {
      return res.json({ message: 'No more users to show' });
    }

    res.json(nextUser[0]);
  } catch (error) {
    console.error('Next profile error:', error);
    res.status(500).json({ error: 'Failed to get next profile' });
  }
});

export { router as discoverRoutes };

import { Router } from 'express';
import { db } from './db.js';
import { profiles, users } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

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

// Debug endpoint to get all users without filtering
router.get('/debug-all-users', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('🔍 Debug endpoint - User:', {
      id: user.id,
      email: user.email,
      gender: user.gender
    });

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
      currentUser: {
        id: user.id,
        email: user.email,
        gender: user.gender,
        isApproved: user.isApproved,
        isSuspended: user.isSuspended
      },
      users: allUsers
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
});

// Get next profile for swiping
router.get('/next', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    console.log('🔍 Next profile endpoint - User:', {
      id: user.id,
      email: user.email,
      gender: user.gender
    });

    // Get arrays of users this user has interacted with
    const likedUsers = user.likedUsers || [];
    const dislikedUsers = user.dislikedUsers || [];
    const blockedUsers = user.blockedUsers || [];

    // Get all users except current user and those already interacted with
    const excludedUsers = [user.id, ...likedUsers, ...dislikedUsers, ...blockedUsers];

    // Get next user for swiping with profile information
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
          not(inArray(users.id, excludedUsers)),
          eq(users.isApproved, true),
          eq(users.isSuspended, false),
          // Opposite gender filtering
          user.gender === 'male' ? eq(users.gender, 'female') :
          user.gender === 'female' ? eq(users.gender, 'male') :
          // For non-binary, show all except same gender
          user.gender === 'non-binary' ? not(eq(users.gender, 'non-binary')) :
          // For prefer-not-to-say, show all
          eq(users.gender, users.gender)
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

import { Router } from 'express';
import { db } from './db.js';
import { profiles, users } from './shared/schema.js';
import { eq, and, not, inArray } from 'drizzle-orm';
import { requireAuth } from './middleware/auth.js';

const router = Router();

// Get discoverable profiles (opposite gender, not liked/disliked/blocked)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('🔍 Discover endpoint - User:', {
      id: user.id,
      email: user.email,
      gender: user.gender,
      isApproved: user.isApproved,
      isSuspended: user.isSuspended
    });

    // Check if user has required fields
    if (!user.gender) {
      console.log('❌ Discover endpoint - User missing gender field');
      return res.status(400).json({ error: 'User profile incomplete - gender field missing' });
    }

    // Get arrays of users this user has interacted with
    const likedUsers = user.likedUsers || [];
    const dislikedUsers = user.dislikedUsers || [];
    const blockedUsers = user.blockedUsers || [];

    console.log('🔍 Discover endpoint - User interactions:', {
      likedUsers: likedUsers.length,
      dislikedUsers: dislikedUsers.length,
      blockedUsers: blockedUsers.length
    });

    // Get all users except current user and those already interacted with
    const excludedUsers = [user.id, ...likedUsers, ...dislikedUsers, ...blockedUsers];

    console.log('🔍 Discover endpoint - Excluded users count:', excludedUsers.length);

    // First, let's check if there are any users in the database at all
    const totalUsers = await db.select({ id: users.id, gender: users.gender, isApproved: users.isApproved }).from(users);
    console.log('🔍 Discover endpoint - Total users in database:', totalUsers.length);
    console.log('🔍 Discover endpoint - Sample users:', totalUsers.slice(0, 3));

    // Get discoverable users with profile information (opposite gender, approved, not suspended, not interacted with)
    const discoverableUsers = await db
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
          // Opposite gender filtering - essential for dating app
          user.gender === 'male' ? eq(users.gender, 'female') :
          user.gender === 'female' ? eq(users.gender, 'male') :
          // For non-binary, show all except same gender
          user.gender === 'non-binary' ? not(eq(users.gender, 'non-binary')) :
          // For prefer-not-to-say, show all
          eq(users.gender, users.gender)
        )
      )
      .orderBy(users.createdAt)
      .limit(10);

    console.log('🔍 Discover endpoint - Found users:', discoverableUsers.length);
    console.log('🔍 Discover endpoint - First user:', discoverableUsers[0] || 'No users found');

    // Check if profiles table has data
    const totalProfiles = await db.select({ id: profiles.id, userId: profiles.userId }).from(profiles);
    console.log('🔍 Discover endpoint - Total profiles in database:', totalProfiles.length);
    console.log('🔍 Discover endpoint - Sample profiles:', totalProfiles.slice(0, 3));

    res.json(discoverableUsers);
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

import { Router } from 'express';
import { db } from './db.js';
import { profiles, users } from './shared/schema.js';
import { eq, and, not, inArray } from 'drizzle-orm';

const router = Router();

// Get discoverable profiles (opposite gender, not liked/disliked/blocked)
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get current user
    const currentUser = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUser[0];

    // Get arrays of users this user has interacted with
    const likedUsers = user.likedUsers || [];
    const dislikedUsers = user.dislikedUsers || [];
    const blockedUsers = user.blockedUsers || [];

    // Get all users except current user and those already interacted with
    const excludedUsers = [req.session.userId, ...likedUsers, ...dislikedUsers, ...blockedUsers];

    // Get discoverable users (opposite gender, approved, not suspended, not interacted with)
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
      })
      .from(users)
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
      .limit(10);

    res.json(discoverableUsers);
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to get discoverable profiles' });
  }
});

// Get next profile for swiping
router.get('/next', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get current user
    const currentUser = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUser[0];

    // Get arrays of users this user has interacted with
    const likedUsers = user.likedUsers || [];
    const dislikedUsers = user.dislikedUsers || [];
    const blockedUsers = user.blockedUsers || [];

    // Get all users except current user and those already interacted with
    const excludedUsers = [req.session.userId, ...likedUsers, ...dislikedUsers, ...blockedUsers];

    // Get next user for swiping
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
      })
      .from(users)
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

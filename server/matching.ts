import { Router } from 'express';
import { db } from './db.js';
import { users, matches, swipes } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from './middleware/auth.js';

const router = Router();

// Swipe schema
const swipeSchema = z.object({
  swipedId: z.string(),
  isLike: z.boolean(),
});

// Record a swipe (like/dislike)
router.post('/swipe', requireAuth, async (req, res) => {
  try {
    const { swipedId, isLike } = swipeSchema.parse(req.body);
    const user = req.user;

    // Update user arrays
    const likedUsers = (user.likedUsers as string[]) || [];
    const dislikedUsers = (user.dislikedUsers as string[]) || [];

    if (isLike) {
      // Add to liked users if not already there
      if (!likedUsers.includes(swipedId)) {
        likedUsers.push(swipedId);
      }
      // Remove from disliked users if there
      const dislikedIndex = dislikedUsers.indexOf(swipedId);
      if (dislikedIndex > -1) {
        dislikedUsers.splice(dislikedIndex, 1);
      }
    } else {
      // Add to disliked users if not already there
      if (!dislikedUsers.includes(swipedId)) {
        dislikedUsers.push(swipedId);
      }
      // Remove from liked users if there
      const likedIndex = likedUsers.indexOf(swipedId);
      if (likedIndex > -1) {
        likedUsers.splice(likedIndex, 1);
      }
    }

    // Update user in database
    await db.update(users)
      .set({
        likedUsers,
        dislikedUsers,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Record swipe in swipes table
    await db.insert(swipes).values({
      swiperId: user.id,
      swipedId,
      action: isLike,
    });

    // Check for match if it's a like
    let isMatch = false;
    if (isLike) {
      // Check if the other user has also liked this user
      const otherUser = await db.select().from(users).where(eq(users.id, swipedId)).limit(1);
      if (otherUser.length > 0) {
        const otherLikedUsers = (otherUser[0].likedUsers as string[]) || [];
        if (otherLikedUsers.includes(user.id)) {
          isMatch = true;

          // Check if match already exists (in either direction)
          const existingMatch1 = await db.select().from(matches)
            .where(
              and(
                eq(matches.user1Id, user.id),
                eq(matches.user2Id, swipedId)
              )
            )
            .limit(1);
            
          const existingMatch2 = await db.select().from(matches)
            .where(
              and(
                eq(matches.user1Id, swipedId),
                eq(matches.user2Id, user.id)
              )
            )
            .limit(1);
            
          const existingMatch = [...existingMatch1, ...existingMatch2];

          if (existingMatch.length === 0) {
            // Create match record with consistent ordering (alphabetical by ID for consistency)
            const user1Id = req.session.userId < swipedId ? req.session.userId : swipedId;
            const user2Id = req.session.userId < swipedId ? swipedId : req.session.userId;
            
            await db.insert(matches).values({
              user1Id,
              user2Id,
            });
            
            console.log(`Created match: ${user1Id} <-> ${user2Id}`);
          } else {
            console.log(`Match already exists between ${req.session.userId} and ${swipedId}`);
          }

          // Update both users' matches arrays
          const userMatches = user.matches || [];
          const otherUserMatches = otherUser[0].matches || [];

          if (!userMatches.includes(swipedId)) {
            userMatches.push(swipedId);
          }
          if (!otherUserMatches.includes(req.session.userId)) {
            otherUserMatches.push(req.session.userId);
          }

          // Update both users
          await db.update(users)
            .set({ matches: userMatches, updatedAt: new Date() })
            .where(eq(users.id, req.session.userId));

          await db.update(users)
            .set({ matches: otherUserMatches, updatedAt: new Date() })
            .where(eq(users.id, swipedId));
        }
      }
    }

    res.json({ isMatch });
  } catch (error) {
    console.error('Swipe error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }
    res.status(500).json({ error: 'Swipe failed' });
  }
});

// Get user's matches
router.get('/matches', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Get user's matches
    const userMatches = await db.select().from(matches)
      .where(
        and(
          eq(matches.user1Id, user.id)
        )
      );

    const userMatches2 = await db.select().from(matches)
      .where(
        and(
          eq(matches.user2Id, user.id)
        )
      );

    // Combine and get match details
    const allMatches = [...userMatches, ...userMatches2];
    const matchDetails = [];

    for (const match of allMatches) {
      const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
      
      // Get other user's complete profile
      const otherUser = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        age: users.age,
        college: users.college,
        branch: users.branch,
        graduationYear: users.graduationYear,
        profileImageUrl: users.profileImageUrl,
      }).from(users).where(eq(users.id, otherUserId)).limit(1);
      
      if (otherUser.length > 0) {
        matchDetails.push({
          id: match.id,
          userId: otherUserId,
          email: otherUser[0].email,
          firstName: otherUser[0].firstName,
          lastName: otherUser[0].lastName,
          age: otherUser[0].age,
          college: otherUser[0].college,
          branch: otherUser[0].branch,
          graduationYear: otherUser[0].graduationYear,
          profileImageUrl: otherUser[0].profileImageUrl,
          createdAt: match.createdAt,
        });
      }
    }

    console.log('Returning match details:', matchDetails.map(m => ({ matchId: m.id, userId: m.userId })));
    res.json(matchDetails);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Block a user
router.post('/block', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { userId } = req.body;

    // Get current user
    const currentUser = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUser[0];
    const blockedUsers = user.blockedUsers || [];

    // Add to blocked users if not already there
    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
    }

    // Remove from liked and disliked users
    const likedUsers = user.likedUsers || [];
    const dislikedUsers = user.dislikedUsers || [];

    const likedIndex = likedUsers.indexOf(userId);
    if (likedIndex > -1) {
      likedUsers.splice(likedIndex, 1);
    }

    const dislikedIndex = dislikedUsers.indexOf(userId);
    if (dislikedIndex > -1) {
      dislikedUsers.splice(dislikedIndex, 1);
    }

    // Update user
    await db.update(users)
      .set({
        blockedUsers,
        likedUsers,
        dislikedUsers,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.session.userId));

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Admin endpoint to fix match inconsistencies
router.post('/fix-matches', async (req, res) => {
  try {
    // Get all matches
    const allMatches = await db.select().from(matches);
    
    console.log(`Found ${allMatches.length} total matches`);
    
    // Group matches by user pairs
    const matchPairs = new Map();
    
    for (const match of allMatches) {
      const pair = [match.user1Id, match.user2Id].sort().join('-');
      if (!matchPairs.has(pair)) {
        matchPairs.set(pair, []);
      }
      matchPairs.get(pair).push(match);
    }
    
    let duplicatesRemoved = 0;
    
    // Remove duplicates and fix inconsistencies
    for (const [pair, matches] of matchPairs) {
      if (matches.length > 1) {
        console.log(`Found ${matches.length} duplicate matches for pair ${pair}`);
        
        // Keep the oldest match, delete the rest
        matches.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const keepMatch = matches[0];
        const deleteMatches = matches.slice(1);
        
        for (const deleteMatch of deleteMatches) {
          await db.delete(matches).where(eq(matches.id, deleteMatch.id));
          duplicatesRemoved++;
        }
        
        console.log(`Kept match ${keepMatch.id}, removed ${deleteMatches.length} duplicates`);
      }
    }
    
    res.json({ 
      message: `Fixed match inconsistencies`,
      totalMatches: allMatches.length,
      duplicatesRemoved,
      uniquePairs: matchPairs.size
    });
  } catch (error) {
    console.error('Fix matches error:', error);
    res.status(500).json({ error: 'Failed to fix matches' });
  }
});

export { router as matchingRoutes };

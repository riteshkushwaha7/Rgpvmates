import { Router } from 'express';
import { db } from './db.js';
import { messages, matches, users } from './shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from './middleware/auth.js';

const router = Router();

// Debug middleware for all messages routes (reduced logging)
router.use((req, res, next) => {
  if (req.path !== '/unread/count') {
    console.log(`Messages API: ${req.method} ${req.path}`);
  }
  next();
});

// Test route to verify messages API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Messages API is working', timestamp: new Date().toISOString() });
});

// Test route for match endpoint
router.get('/match/test', (req, res) => {
  res.json({ message: 'Match endpoint is working', timestamp: new Date().toISOString() });
});

// Message schema
const messageSchema = z.object({
  matchId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
});

// Get unread message count for user
router.get('/unread/count', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Get all matches for the current user
    const userMatches = await db.select().from(matches)
      .where(eq(matches.user1Id, user.id));

    const userMatches2 = await db.select().from(matches)
      .where(eq(matches.user2Id, user.id));

    const allMatches = [...userMatches, ...userMatches2];
    let totalUnread = 0;

    // Count unread messages in each match
    for (const match of allMatches) {
      const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
      
      const unreadCount = await db.select().from(messages)
        .where(
          and(
            eq(messages.matchId, match.id),
            eq(messages.senderId, otherUserId),
            eq(messages.isRead, false)
          )
        );

      totalUnread += unreadCount.length;
    }

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get chat history for a specific match
router.get('/match/:matchId', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { matchId } = req.params;
    
    // First, check if this match exists at all
    const allMatches = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    
    if (allMatches.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify that the user is part of this match (fix OR condition)
    const match1 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user1Id, user.id)
        )
      )
      .limit(1);
      
    const match2 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user2Id, req.session.userId)
        )
      )
      .limit(1);
      
    const match = [...match1, ...match2];

    if (match.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this match' });
    }

    // Get messages for this match
    const chatMessages = await db.select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      matchId: messages.matchId,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.matchId, matchId))
    .orderBy(desc(messages.createdAt));

    // Get sender information for each message
    const messagesWithSenderInfo = await Promise.all(
      chatMessages.map(async (message) => {
        const sender = await db.select({
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, message.senderId))
        .limit(1);

        return {
          ...message,
          senderFirstName: sender[0]?.firstName,
          senderLastName: sender[0]?.lastName,
        };
      })
    );

    // Mark messages as read if they're from the other user
    const otherUserId = match[0].user1Id === req.session.userId ? match[0].user2Id : match[0].user1Id;
    
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.senderId, otherUserId),
          eq(messages.isRead, false)
        )
      );

    res.json(messagesWithSenderInfo.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId, content } = messageSchema.parse(req.body);

    // Verify that the user is part of this match
    const match1 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user1Id, req.session.userId)
        )
      )
      .limit(1);
      
    const match2 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user2Id, req.session.userId)
        )
      )
      .limit(1);
      
    const match = [...match1, ...match2];

    if (match.length === 0) {
      return res.status(403).json({ error: 'Not authorized to send message in this match' });
    }

    // Create message
    const [newMessage] = await db.insert(messages).values({
      matchId,
      senderId: req.session.userId,
      content,
      isRead: false,
    }).returning();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid message data' });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read/:matchId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId } = req.params;

    // Verify that the user is part of this match
    const match1 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user1Id, req.session.userId)
        )
      )
      .limit(1);
      
    const match2 = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          eq(matches.user2Id, req.session.userId)
        )
      )
      .limit(1);
      
    const match = [...match1, ...match2];

    if (match.length === 0) {
      return res.status(403).json({ error: 'Not authorized to mark messages in this match' });
    }

    // Mark unread messages from other user as read
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.senderId, req.session.userId === match[0].user1Id ? match[0].user2Id : match[0].user1Id),
          eq(messages.isRead, false)
        )
      );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export { router as messageRoutes };

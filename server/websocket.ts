import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import { messages, matches, users } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

interface ConnectedUser {
  userId: string;
  ws: WebSocket;
  isAdmin: boolean;
}

const connectedUsers = new Map<string, ConnectedUser>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: any) => {
    console.log('New WebSocket connection attempt');

    // Extract user info from query params
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId');
    const isAdmin = url.searchParams.get('isAdmin') === 'true';

    if (!userId) {
      console.log('WebSocket: No userId provided, closing connection');
      ws.close(1008, 'User ID required');
      return;
    }

    // Clean up any existing connection for this user (prevent duplicates)
    if (connectedUsers.has(userId)) {
      console.log(`WebSocket: Cleaning up existing connection for user ${userId}`);
      const existingConnection = connectedUsers.get(userId);
      if (existingConnection?.ws.readyState === 1) {
        existingConnection.ws.close();
      }
      connectedUsers.delete(userId);
    }

    // Store new connection
    connectedUsers.set(userId, { userId, ws, isAdmin });
    console.log(`✅ User ${userId} connected successfully. Total: ${connectedUsers.size}`);

    // Send connection confirmation with user verification
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected successfully',
      userId: userId,
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`📨 WebSocket message from ${userId}:`, { type: message.type, matchId: message.matchId });
        
        // Verify the user is still connected
        if (!connectedUsers.has(userId)) {
          console.log(`❌ User ${userId} not in connected users, rejecting message`);
          ws.close(1008, 'User not authenticated');
          return;
        }
        
        switch (message.type) {
          case 'send_message':
            console.log(`🚀 Processing send_message from ${userId} to match ${message.matchId}`);
            await handleSendMessage(userId, message);
            break;
          
          case 'mark_read':
            await handleMarkRead(userId, message);
            break;
          
          case 'typing':
            await handleTyping(userId, message);
            break;
          
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', userId }));
            break;
          
          default:
            console.log(`⚠️ Unknown message type from ${userId}:`, message.type);
        }
      } catch (error) {
        console.error(`❌ WebSocket message error for user ${userId}:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          userId: userId
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      connectedUsers.delete(userId);
      console.log(`👋 User ${userId} disconnected. Total: ${connectedUsers.size}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`💥 WebSocket error for user ${userId}:`, error);
      connectedUsers.delete(userId);
    });
  });
}

async function handleSendMessage(senderId: string, message: any) {
  try {
    const { matchId, content } = message;
    
    if (!matchId || !content || !senderId) {
      console.log(`❌ Invalid message data:`, { senderId, matchId, content });
      return;
    }
    
    console.log(`💬 SEND MESSAGE: ${senderId} → Match ${matchId}: "${content}"`);

    // Verify match exists and user is part of it
    const match1 = await db.select().from(matches)
      .where(and(eq(matches.id, matchId), eq(matches.user1Id, senderId)))
      .limit(1);
      
    const match2 = await db.select().from(matches)
      .where(and(eq(matches.id, matchId), eq(matches.user2Id, senderId)))
      .limit(1);
      
    const userMatches = [...match1, ...match2];
    
    if (userMatches.length === 0) {
      console.log(`❌ User ${senderId} not authorized for match ${matchId}`);
      return;
    }

    const match = userMatches[0];
    const recipientId = match.user1Id === senderId ? match.user2Id : match.user1Id;
    
    console.log(`📝 Creating message in database...`);
    
    // Create message in database with explicit senderId
    const [newMessage] = await db.insert(messages).values({
      matchId: matchId,
      senderId: senderId, // Explicitly use the WebSocket senderId
      content: content,
      isRead: false,
    }).returning();
    
    console.log(`✅ Message saved: ID=${newMessage.id}, Sender=${newMessage.senderId}`);

    // Get sender info for message display
    const sender = await db.select({
      firstName: users.firstName,
      lastName: users.lastName,
    }).from(users).where(eq(users.id, senderId)).limit(1);

    const messagePayload = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.senderId, // Use the actual saved senderId
      matchId: newMessage.matchId,
      createdAt: newMessage.createdAt,
      senderFirstName: sender[0]?.firstName,
      senderLastName: sender[0]?.lastName,
    };

    // Send to recipient if online
    const recipient = connectedUsers.get(recipientId);
    if (recipient && recipient.ws.readyState === 1) {
      console.log(`📤 Sending to recipient ${recipientId}`);
      recipient.ws.send(JSON.stringify({
        type: 'new_message',
        message: messagePayload,
      }));
    } else {
      console.log(`📪 Recipient ${recipientId} is offline`);
    }

    // Send confirmation to sender
    const senderWs = connectedUsers.get(senderId);
    if (senderWs && senderWs.ws.readyState === 1) {
      console.log(`✅ Confirming to sender ${senderId}`);
      senderWs.ws.send(JSON.stringify({
        type: 'message_sent',
        messageId: newMessage.id,
        message: messagePayload, // Include the message for optimistic update
      }));
    }

  } catch (error) {
    console.error(`💥 Error in handleSendMessage:`, error);
  }
}

async function handleMarkRead(userId: string, message: any) {
  try {
    const { matchId } = message;

    // Verify that the user is part of this match
    const match = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          (eq(matches.user1Id, userId) || eq(matches.user2Id, userId))
        )
      )
      .limit(1);

    if (match.length === 0) {
      return;
    }

    // Mark messages as read
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.senderId, userId === match[0].user1Id ? match[0].user2Id : match[0].user1Id),
          eq(messages.isRead, false)
        )
      );

    // Notify the other user that messages were read
    const otherUserId = match[0].user1Id === userId ? match[0].user2Id : match[0].user1Id;
    const otherUser = connectedUsers.get(otherUserId);
    if (otherUser) {
      otherUser.ws.send(JSON.stringify({
        type: 'messages_read',
        matchId,
        readBy: userId,
      }));
    }

  } catch (error) {
    console.error('Handle mark read error:', error);
  }
}

async function handleTyping(userId: string, message: any) {
  try {
    const { matchId, isTyping } = message;

    // Verify that the user is part of this match
    const match = await db.select().from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          (eq(matches.user1Id, userId) || eq(matches.user2Id, userId))
        )
      )
      .limit(1);

    if (match.length === 0) {
      return;
    }

    // Notify the other user about typing status
    const otherUserId = match[0].user1Id === userId ? match[0].user2Id : match[0].user1Id;
    const otherUser = connectedUsers.get(otherUserId);
    if (otherUser) {
      otherUser.ws.send(JSON.stringify({
        type: 'typing',
        matchId,
        userId,
        isTyping,
      }));
    }

  } catch (error) {
    console.error('Handle typing error:', error);
  }
}

// Utility function to send notification to specific user
export function sendNotification(userId: string, notification: any) {
  const user = connectedUsers.get(userId);
  if (user) {
    user.ws.send(JSON.stringify({
      type: 'notification',
      ...notification,
    }));
  }
}

// Utility function to broadcast to all connected users
export function broadcastToAll(message: any) {
  connectedUsers.forEach((user) => {
    user.ws.send(JSON.stringify(message));
  });
}

// Utility function to broadcast to admins only
export function broadcastToAdmins(message: any) {
  connectedUsers.forEach((user) => {
    if (user.isAdmin) {
      user.ws.send(JSON.stringify(message));
    }
  });
}

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { db } from './db.js';
import { routes } from './routes.js';
import { setupWebSocket } from './websocket.js';

// Extend session interface to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    isAdmin?: boolean;
    testValue?: string;
  }
}

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://rgpvmates.vercel.app',
  'http://localhost:5173', // Local development
  'http://localhost:3000'  // Alternative local port
].filter(Boolean);

console.log('🔧 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email', 'x-user-password', 'x-admin-username', 'x-admin-password']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ROBUST SESSION CONFIGURATION - Optimized for Railway
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true, // Changed to true for better persistence
  saveUninitialized: true, // Changed to true to save sessions immediately
  cookie: {
    secure: false, // Railway handles HTTPS, set to false to avoid issues
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - longer session
    sameSite: 'lax', // Use lax for Railway compatibility
  },
  name: 'rgpvmates.sid', // Custom session name
});

console.log('🔧 Session configured with robust settings for Railway');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not Set');
console.log('🔧 Session cookie settings:', {
  secure: false,
  httpOnly: true,
  maxAge: '7 days',
  sameSite: 'lax'
});

app.use(sessionMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// WebSocket setup
setupWebSocket(wss);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

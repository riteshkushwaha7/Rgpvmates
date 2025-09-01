import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
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
  'https://rgpvmates.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration - using PostgreSQL store for production
let sessionStore;

// Create PostgreSQL session store
const PgSession = connectPgSimple(session);
sessionStore = new PgSession({
  conObject: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  tableName: 'sessions',
  createTableIfMissing: false, // We'll create it manually
});

console.log('🔧 PostgreSQL session store created');

// Manually create sessions table if it doesn't exist
const createSessionsTable = async () => {
  try {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    await client.connect();
    
    // Drop existing table if it exists (to avoid conflicts)
    await client.query('DROP TABLE IF EXISTS sessions CASCADE');
    
    const createTableSQL = `
      CREATE TABLE sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      
      CREATE INDEX "IDX_sessions_expire" ON sessions (expire);
    `;
    
    await client.query(createTableSQL);
    await client.end();
    
    console.log('✅ Sessions table created successfully');
  } catch (error) {
    console.error('❌ Failed to create sessions table:', error);
    console.log('🔄 Falling back to MemoryStore...');
    
    // If table creation fails, use MemoryStore
    const MemoryStore = require('memorystore')(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    console.log('🔧 Switched to MemoryStore');
  }
};

// Create sessions table on startup
createSessionsTable();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
  store: sessionStore,
});

console.log('🔧 Session store configured with PostgreSQL');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

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

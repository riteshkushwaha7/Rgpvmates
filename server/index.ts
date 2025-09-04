import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { db } from './db.js';
import { routes } from './routes.js';
import { setupWebSocket } from './websocket.js';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-admin-username', 'x-admin-password']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NO SESSION MANAGEMENT - Using localStorage + user ID validation
console.log('🔧 NO SESSION - Using localStorage + user ID validation');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

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

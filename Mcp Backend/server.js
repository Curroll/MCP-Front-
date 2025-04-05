import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { setupSocket } from './services/socket.js';
import { EventEmitter } from 'events';
import sharedRoutes from './routes/shared.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js'; // Make sure this import exists


// Increase event listener limit
EventEmitter.defaultMaxListeners = 15;

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

app.use(cors({ // ✅ Now this won't throw
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use('/api/mcp', dashboardRoutes);

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false // Disable deprecated headers
});

// Middleware
app.use(express.json());

// Apply rate limiting to auth routes
app.use('/api/auth', authLimiter);
app.use('/api', sharedRoutes);

// Routes (must come before socket.io initialization)
app.use('/api/auth', authRoutes); // This enables /api/auth/register


// Test Route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Database connection and server startup
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');
    
    setupSocket(io);
    
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
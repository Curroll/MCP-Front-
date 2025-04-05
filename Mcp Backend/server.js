import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { setupSocket } from './services/socket.js';
import { EventEmitter } from 'events';
import authRoutes from './routes/auth.js'; // Make sure this import exists

// Increase event listener limit
EventEmitter.defaultMaxListeners = 15;

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());

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
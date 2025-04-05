import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logger.warn('Socket connection attempt without token');
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      logger.error('Socket authentication error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.user.id})`);

    // Join user-specific room
    socket.join(`user_${socket.user.id}`);
    
    // Join MCP room if applicable
    if (socket.user.role === 'partner') {
      socket.join(`mcp_${socket.user.mcpId}`);
    }

    // GPS tracking
    socket.on('location_update', (data) => {
      if (!data.lat || !data.lng) {
        return socket.emit('error', 'Invalid location data');
      }

      logger.debug(`Location update from ${socket.user.id}:`, data);
      
      // Broadcast to MCP room
      if (socket.user.role === 'partner') {
        io.to(`mcp_${socket.user.mcpId}`).emit('partner_location', {
          partnerId: socket.user.id,
          location: {
            lat: data.lat,
            lng: data.lng
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    // Order updates
    socket.on('order_update', (data) => {
      // Validate and process order updates
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.user.id})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}:`, err);
    });
  });

  // Heartbeat check
  setInterval(() => {
    io.emit('ping', new Date().toISOString());
  }, 30000);
};
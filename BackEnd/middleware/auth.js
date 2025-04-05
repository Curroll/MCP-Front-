import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Authentication attempt without token');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.warn(`User not found for token: ${decoded.id}`);
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      logger.warn(`Inactive user attempt: ${user._id}`);
      return res.status(403).json({ error: 'Account deactivated' });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      logger.warn(`Password changed after token issued for user: ${user._id}`);
      return res.status(401).json({ error: 'Password changed. Please log in again.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(401).json({ error: 'Not authorized' });
  }
};

export const isMCP = (req, res, next) => {
  if (req.user.role !== 'mcp') {
    logger.warn(`Unauthorized MCP access attempt by ${req.user._id}`);
    return res.status(403).json({ error: 'MCP access only' });
  }
  next();
};

export const isPartner = (req, res, next) => {
  if (req.user.role !== 'partner') {
    logger.warn(`Unauthorized Partner access attempt by ${req.user._id}`);
    return res.status(403).json({ error: 'Partner access only' });
  }
  next();
};

export const rateLimiter = (req, res, next) => {
  // Implement rate limiting logic here
  next();
};
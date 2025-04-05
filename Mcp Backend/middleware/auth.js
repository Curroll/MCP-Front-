import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
};

export const isMCP = (req, res, next) => {
  if (req.user.role !== 'mcp') {
    return res.status(403).json({ error: 'MCP access only' });
  }
  next();
};

export const isPartner = (req, res, next) => {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ error: 'Partner access only' });
  }
  next();
};
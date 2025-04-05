import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Protect route middleware
export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    console.error('Auth error:', {
      path: req.path,
      method: req.method,
      errorType: error.name,
      // Don't expose raw error message which might contain sensitive info
    });
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

// ✅ Role-based access control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

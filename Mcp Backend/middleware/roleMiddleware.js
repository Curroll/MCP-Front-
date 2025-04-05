export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn('Role check failed - no user', {
        path: req.path,
        method: req.method
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn('Role check failed', {
        path: req.path,
        method: req.method,
        requiredRoles: roles,
        // Don't expose actual role in logs
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    console.debug('Role check passed', {
      path: req.path,
      method: req.method,
      userId: req.user._id
    });
    next();
  };
};
  
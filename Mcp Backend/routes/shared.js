import express from 'express';
import auth from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post('/shared-route', auth, authorizeRoles('mcp', 'partner'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Hello ${req.user.role}, you have access to this shared route`
  });
});

export default router;

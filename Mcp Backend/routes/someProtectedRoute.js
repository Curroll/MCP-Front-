import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/mcp-dashboard', protect, authorizeRoles('mcp'), (req, res) => {
  res.json({ message: `Welcome MCP: ${req.user.name}` });
});

router.get('/partner-dashboard', protect, authorizeRoles('partner'), (req, res) => {
  res.json({ message: `Welcome Partner: ${req.user.name}` });
});

export default router;

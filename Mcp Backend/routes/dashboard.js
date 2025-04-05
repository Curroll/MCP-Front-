import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// 🔐 Only MCP can access this
router.get('/dashboard', protect, authorizeRoles('mcp'), async (req, res) => {
  try {
    const mcpId = req.user._id;

    // Get MCP wallet balance
    const mcp = await User.findById(mcpId);
    const walletBalance = mcp.walletBalance;

    // Get all mapped Pickup Partners
    const partners = await User.find({ mcpId });

    // Get all orders where mcpId matches
    const orders = await Order.find({ mcpId });

    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status !== 'completed').length;

    res.json({
      walletBalance,
      partners: partners.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        isActive: p.isActive,
        walletBalance: p.walletBalance,
      })),
      totalOrders: orders.length,
      completedOrders,
      pendingOrders
    });
  } catch (error) {
    console.error('❌ MCP Dashboard Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;

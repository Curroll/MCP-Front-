import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Transfer funds
router.post('/transfer', auth, authorizeRoles('mcp', 'partner'), async (req, res) => {
  try {
    const { toId, amount } = req.body;

    if (req.user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Atomic transfer
    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -amount } });
    await User.findByIdAndUpdate(toId, { $inc: { walletBalance: amount } });

    // Record transaction
    await Transaction.create({
      from: req.user._id,
      to: toId,
      amount,
      type: 'transfer'
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
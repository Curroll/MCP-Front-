import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { auth, isMCP } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', auth, isMCP, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString()
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete order
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (req.body.code !== order.pickupCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedAt: Date.now(),
        pickupProof: req.body.imageUrl
      },
      { new: true }
    );

    // Credit partner
    const earnings = order.amount * (1 - order.commission);
    await User.findByIdAndUpdate(
      order.assignedTo,
      { $inc: { walletBalance: earnings } }
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
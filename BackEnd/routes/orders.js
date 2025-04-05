import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { auth, isMCP } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Create order
router.post('/', auth, isMCP, async (req, res, next) => {
  try {
    const { assignedTo, amount, items } = req.body;

    if (!assignedTo || !amount || !items || !items.length) {
      return res.status(400).json({
        error: 'Required fields: assignedTo, amount, items'
      });
    }

    const partner = await User.findById(assignedTo);
    if (!partner || partner.role !== 'partner') {
      return res.status(400).json({
        error: 'Invalid partner assignment'
      });
    }

    const order = await Order.create({
      ...req.body,
      createdBy: req.user._id,
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'pending'
    });

    // Notify partner via WebSocket if implemented

    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });

  } catch (error) {
    logger.error('Order creation error:', error);
    next(error);
  }
});

// Complete order
router.post('/:id/complete', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        error: 'Order already processed'
      });
    }

    if (req.body.code !== order.pickupCode) {
      return res.status(400).json({
        error: 'Invalid verification code'
      });
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedAt: Date.now(),
        pickupProof: req.body.imageUrl,
        completedBy: req.user._id
      },
      { new: true, session }
    );

    // Calculate earnings (assuming commission is a percentage)
    const earnings = order.amount * (1 - (order.commission || 0.1));

    // Credit partner
    await User.findByIdAndUpdate(
      order.assignedTo,
      { $inc: { walletBalance: earnings } },
      { session }
    );

    // Record transaction
    await Transaction.create([{
      from: order.createdBy,
      to: order.assignedTo,
      amount: earnings,
      type: 'order_completion',
      order: order._id,
      status: 'completed'
    }], { session });

    await session.commitTransaction();
    
    res.json({
      status: 'success',
      data: {
        order: updatedOrder
      }
    });

  } catch (error) {
    await session.abortTransaction();
    logger.error('Order completion error:', error);
    next(error);
  } finally {
    session.endSession();
  }
});

// Get orders
router.get('/', auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'partner') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'mcp') {
      query.createdBy = req.user._id;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo createdBy', 'name email');

    const total = await Order.countDocuments(query);

    res.json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
});

export default router;
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { auth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.json({
      status: 'success',
      data: {
        balance: user.walletBalance
      }
    });
  } catch (error) {
    logger.error('Wallet balance error:', error);
    next(error);
  }
});

// Transfer funds
router.post('/transfer', auth, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { toId, amount, note } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be positive'
      });
    }

    if (req.user._id.toString() === toId) {
      return res.status(400).json({
        error: 'Cannot transfer to yourself'
      });
    }

    const recipient = await User.findById(toId).session(session);
    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found'
      });
    }

    if (req.user.walletBalance < amount) {
      return res.status(400).json({
        error: 'Insufficient balance'
      });
    }

    // Perform transfer
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -amount } },
      { session }
    );

    await User.findByIdAndUpdate(
      toId,
      { $inc: { walletBalance: amount } },
      { session }
    );

    // Record transaction
    const transaction = await Transaction.create([{
      from: req.user._id,
      to: toId,
      amount,
      type: 'transfer',
      note,
      status: 'completed'
    }], { session });

    await session.commitTransaction();
    
    res.json({
      status: 'success',
      data: {
        transaction: transaction[0]
      }
    });

  } catch (error) {
    await session.abortTransaction();
    logger.error('Fund transfer error:', error);
    next(error);
  } finally {
    session.endSession();
  }
});

// Transaction history
router.get('/transactions', auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('from to', 'name email');

    const total = await Transaction.countDocuments({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    });

    res.json({
      status: 'success',
      results: transactions.length,
      data: {
        transactions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Transaction history error:', error);
    next(error);
  }
});

export default router;
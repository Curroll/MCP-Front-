import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Register User
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, mcpId } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      logger.warn('Registration attempt with missing fields');
      return res.status(400).json({ 
        error: 'All required fields must be provided' 
      });
    }

    if (role === 'partner' && !mcpId) {
      return res.status(400).json({
        error: 'Partners must be linked to an MCP'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      mcpId: role === 'partner' ? mcpId : undefined
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send welcome email
    await sendEmail({
      email: newUser.email,
      subject: 'Welcome to MCP System',
      template: 'welcome',
      context: {
        name: newUser.name,
        role: newUser.role
      }
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// Login User
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account deactivated. Please contact support.'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      status: 'success',
      token,
      data: {
        user
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      logger.warn(`Password reset request for non-existent email: ${req.body.email}`);
      return res.status(404).json({
        error: 'No user found with that email'
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        template: 'passwordReset',
        context: {
          name: user.name,
          resetURL
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
      });

    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Error sending password reset email:', err);
      return res.status(500).json({
        error: 'There was an error sending the email. Try again later.'
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
});

// Reset Password
router.patch('/reset-password/:token', async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token is invalid or has expired'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    next(error);
  }
});

export default router;
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// Safe logging utility
const safeLog = {
  user: (user) => {
    if (!user) return 'null';
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      // Explicitly exclude sensitive fields:
      // password: '[REDACTED]',
      // passwordChangedAt: '[REDACTED]',
      // passwordResetToken: '[REDACTED]',
      // passwordResetExpires: '[REDACTED]'
    };
  },
  request: (req) => {
    return {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: {
        ...req.body,
        // Redact sensitive fields from request body
        password: req.body.password ? '[REDACTED]' : undefined
      }
    };
  }
};

const router = express.Router();
console.log('📦 Auth routes loaded');

// ============================
// 📌 Register Route
// ============================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mcpId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password.toString(),
      role,
      ...(role === 'partner' && { mcpId }),
    });

    console.log("🆔 Registered User ID:", user._id);

    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ============================
// 🔐 Login Route
// ============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📩 Request:", safeLog.request(req));

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // ✅ Variable declared here before any usage
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    console.log("👤 User fetched from DB:", safeLog.user(user));
    
    const isMatch = await bcrypt.compare(password.toString(), user.password);
    console.log("✅ Authentication attempt for:", user.email, "Result:", isMatch ? "Success" : "Failure");

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
      token,
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message,
    });
  }
});


export default router;

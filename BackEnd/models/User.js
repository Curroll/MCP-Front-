import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { logger } from '../utils/logger.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['mcp', 'partner'],
    default: 'mcp'
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    get: v => Math.round(v * 100) / 100
  },
  mcpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(v) {
        if (this.role === 'partner' && !v) return false;
        if (v) {
          const mcp = await mongoose.model('User').findById(v);
          return mcp && mcp.role === 'mcp';
        }
        return true;
      },
      message: 'Partners must be linked to a valid MCP'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    getters: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ mcpId: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Password encryption
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (err) {
    logger.error('Password hashing error:', err);
    next(err);
  }
});

// Password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Changed password after JWT was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Virtual for partner's MCP details
UserSchema.virtual('mcpDetails', {
  ref: 'User',
  localField: 'mcpId',
  foreignField: '_id',
  justOne: true
});

const User = mongoose.model('User', UserSchema);
export default User;
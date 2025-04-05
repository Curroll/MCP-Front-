import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// ===========================
// 🧠 User Schema Definition
// ===========================
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['mcp', 'partner'],
        message: 'Role must be either mcp or partner',
      },
      default: 'mcp',
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    mcpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: async function (v) {
          if (this.role === 'partner' && !v) return false;
          if (v) {
            const mcp = await mongoose.model('User').findById(v);
            return mcp && mcp.role === 'mcp';
          }
          return true;
        },
        message: 'Partners must be linked to a valid MCP',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===========================
// 🔍 Indexes
// ===========================
UserSchema.index({ mcpId: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// ===========================
// 🔐 Hash Password Before Save
// ===========================
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // subtract 1 sec
    next();
  } catch (err) {
    next(err);
  }
});

// ===========================
// 🔍 Check If Password Changed After Token
// ===========================
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ===========================
// 🔐 Compare Password (Login)
// ===========================
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ===========================
// 🔑 Generate Reset Token
// ===========================
UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// ===========================
// 🔁 Virtual for MCP Details
// ===========================
UserSchema.virtual('mcpDetails', {
  ref: 'User',
  localField: 'mcpId',
  foreignField: '_id',
  justOne: true,
});

// ===========================
// 📦 Export User Model
// ===========================
const User = mongoose.model('User', UserSchema);
export default User;

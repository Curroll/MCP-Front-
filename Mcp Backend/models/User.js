import mongoose from 'mongoose';

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
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never returned in queries
  },
  role: {
    type: String,
    enum: {
      values: ['mcp', 'partner'],
      message: 'Role must be either mcp or partner'
    },
    default: 'mcp'
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ mcpId: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Password encryption middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
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

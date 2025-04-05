import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  type: { 
    type: String, 
    enum: ['transfer', 'withdrawal', 'deposit', 'order_completion'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  note: String,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
TransactionSchema.index({ from: 1 });
TransactionSchema.index({ to: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });

// Virtuals
TransactionSchema.virtual('sender', {
  ref: 'User',
  localField: 'from',
  foreignField: '_id',
  justOne: true
});

TransactionSchema.virtual('receiver', {
  ref: 'User',
  localField: 'to',
  foreignField: '_id',
  justOne: true
});

TransactionSchema.virtual('orderDetails', {
  ref: 'Order',
  localField: 'order',
  foreignField: '_id',
  justOne: true
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    default: 0.1, // 10% commission
    min: 0,
    max: 1
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  pickupCode: {
    type: String,
    required: true
  },
  pickupProof: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
OrderSchema.index({ createdBy: 1 });
OrderSchema.index({ assignedTo: 1 });
OrderSchema.index({ status: 1 });

// Virtuals
OrderSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

OrderSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
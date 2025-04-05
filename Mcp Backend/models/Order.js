import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerAddress: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'completed'], 
    default: 'pending' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true, min: [0, 'Amount must be positive'] },
  commission: { type: Number, default: 0.1 },
  pickupCode: { type: String },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);

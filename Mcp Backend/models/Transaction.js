const TransactionSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['transfer', 'withdrawal', 'deposit'] }
  }, { timestamps: true });
  
  export default mongoose.model('Transaction', TransactionSchema);
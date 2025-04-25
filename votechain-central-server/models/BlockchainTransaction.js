const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['voter_registration', 'candidate_registration', 'vote_cast'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Voter', 'Candidate']
  },
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number,
    sparse: true
  },
  gasUsed: {
    type: Number,
    sparse: true
  },
  error: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
blockchainTransactionSchema.index({ txHash: 1 });
blockchainTransactionSchema.index({ userId: 1, userType: 1 });
blockchainTransactionSchema.index({ status: 1 });
blockchainTransactionSchema.index({ type: 1 });

const BlockchainTransaction = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);

module.exports = BlockchainTransaction; 
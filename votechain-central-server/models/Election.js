const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  blockchainContractAddress: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
electionSchema.index({ startDate: 1 });
electionSchema.index({ endDate: 1 });
electionSchema.index({ status: 1 });

const Election = mongoose.model('Election', electionSchema);

module.exports = Election; 
// const mongoose = require('mongoose');

// const voteSchema = new mongoose.Schema({
//   electionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Election',
//     required: true
//   },
//   candidateId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Candidate',
//     required: true
//   },
//   voterId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Voter',
//     required: true
//   },
//   faceId: {
//     type: String,
//     required: true
//   },
//   fingerprint: {
//     type: String,
//     required: true
//   },
//   blockchainTxHash: {
//     type: String,
//     sparse: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'failed'],
//     default: 'pending'
//   },
//   verificationStatus: {
//     type: String,
//     enum: ['pending', 'verified', 'failed'],
//     default: 'pending'
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// voteSchema.index({ electionId: 1 });
// voteSchema.index({ candidateId: 1 });
// voteSchema.index({ voterId: 1 });
// voteSchema.index({ blockchainTxHash: 1 });

// const Vote = mongoose.model('Vote', voteSchema);

// module.exports = Vote; 
import mongoose from 'mongoose';

const voterSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  fathersName: {
    type: String,
    required: true,
    trim: true
  },
  mothersName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    trim: true
  },
  postOffice: {
    type: String,
    required: true,
    trim: true
  },
  postCode: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
voterSchema.index({ nationalId: 1 });
voterSchema.index({ walletAddress: 1 });
voterSchema.index({ isRegistered: 1 });
voterSchema.index({ isVerified: 1 });
voterSchema.index({ verificationStatus: 1 });

const Voter = mongoose.model('Voter', voterSchema);

export default Voter; 
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
  faceId: {
    type: String,
    required: [true, 'Face ID is required'],
    trim: true,
    minlength: [32, 'Face ID must be at least 32 characters long']
  },
  fingerprintHash: {
    type: String,
    trim: true,
    default: null
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  blockchainId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: props => `${props.value} is not a valid blockchain transaction hash!`
    }
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
voterSchema.index({ blockchainId: 1 });
voterSchema.index({ isRegistered: 1 });
voterSchema.index({ isVerified: 1 });
voterSchema.index({ verificationStatus: 1 });

const Voter = mongoose.model('Voter', voterSchema, 'voterCollection');

export default Voter; 
import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  party: {
    type: String,
    required: [true, 'Party is required'],
    trim: true,
    minlength: [2, 'Party name must be at least 2 characters long'],
    maxlength: [100, 'Party name cannot exceed 100 characters']
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid national ID! Must be 10 digits.`
    }
  },
  fathersName: {
    type: String,
    required: [true, 'Father\'s name is required'],
    trim: true,
    minlength: [2, 'Father\'s name must be at least 2 characters long'],
    maxlength: [100, 'Father\'s name cannot exceed 100 characters']
  },
  mothersName: {
    type: String,
    required: [true, 'Mother\'s name is required'],
    trim: true,
    minlength: [2, 'Mother\'s name must be at least 2 characters long'],
    maxlength: [100, 'Mother\'s name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(v) {
        const age = new Date().getFullYear() - v.getFullYear();
        return age >= 25 && age <= 100;
      },
      message: 'Candidate must be at least 25 years old and not older than 100 years'
    }
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    trim: true,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: '{VALUE} is not a valid blood group'
    }
  },
  postOffice: {
    type: String,
    required: [true, 'Post office is required'],
    trim: true,
    minlength: [2, 'Post office must be at least 2 characters long'],
    maxlength: [100, 'Post office cannot exceed 100 characters']
  },
  postCode: {
    type: Number,
    required: [true, 'Post code is required'],
    validate: {
      validator: function(v) {
        return v > 0 && v < 10000;
      },
      message: 'Post code must be a positive number less than 10000'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  faceId: {
    type: String,
    required: [true, 'Face ID is required'],
    trim: true,
    minlength: [32, 'Face ID must be at least 32 characters long']
  },
  fingerprint: {
    type: String,
    required: [true, 'Fingerprint is required'],
    trim: true,
    minlength: [32, 'Fingerprint must be at least 32 characters long']
  },
  blockchainId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: props => `${props.value} is not a valid blockchain transaction hash!`
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid verification status'
    },
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Verification notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  collection: 'candidatesCollection'
});

// Indexes
candidateSchema.index({ nationalId: 1 });
candidateSchema.index({ blockchainId: 1 });
candidateSchema.index({ isVerified: 1 });
candidateSchema.index({ verificationStatus: 1 });
candidateSchema.index({ name: 'text', party: 'text', location: 'text' });

// Pre-save middleware to ensure data consistency
candidateSchema.pre('save', function(next) {
  // Ensure all string fields are trimmed
  Object.keys(this.schema.paths).forEach(key => {
    if (this.schema.paths[key].instance === 'String' && this[key]) {
      this[key] = this[key].trim();
    }
  });
  
  // Ensure dateOfBirth is a valid Date object
  if (this.dateOfBirth && !(this.dateOfBirth instanceof Date)) {
    this.dateOfBirth = new Date(this.dateOfBirth);
  }
  
  // Ensure postCode is a number
  if (this.postCode && typeof this.postCode === 'string') {
    this.postCode = parseInt(this.postCode, 10);
  }
  
  next();
});

// Error handling middleware
candidateSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A candidate with this nationalId or blockchainId already exists'));
  } else {
    next(error);
  }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate; 
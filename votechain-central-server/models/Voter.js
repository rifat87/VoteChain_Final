import mongoose from 'mongoose';

const voterSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'National ID must be exactly 10 digits'] // ✅ enforce 10 digits
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    match: [/^[A-Za-z ]+$/, 'Name should contain only letters and spaces'] // ✅ letters & spaces only
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        if (!value) return false;
        const today = new Date();
        let age = today.getFullYear() - value.getFullYear();
        const m = today.getMonth() - value.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
          age--;
        }
        return age >= 18 && age <= 120; // ✅ enforce 18–120 years
      },
      message: 'Voter must be between 18 and 120 years old'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [100, 'Location cannot exceed 100 characters'],
    match: [/^[A-Za-z ,.-]+$/, 'Location can only contain letters, spaces, commas, hyphens, and periods'] // ✅ safe regex
  }
}, {
  timestamps: true,
  collection: 'voterCollection'
});

// Indexes
voterSchema.index({ nationalId: 1 });
voterSchema.index({ name: 'text', location: 'text' });

// Pre-save middleware (auto-trim strings)
voterSchema.pre('save', function(next) {
  Object.keys(this.schema.paths).forEach(key => {
    if (this.schema.paths[key].instance === 'String' && this[key]) {
      this[key] = this[key].trim();
    }
  });
  next();
});

// Error handling middleware for duplicate NID
voterSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A voter with this National ID already exists'));
  } else {
    next(error);
  }
});

const Voter = mongoose.model('Voter', voterSchema);

export default Voter;

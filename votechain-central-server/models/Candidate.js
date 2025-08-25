import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'National ID must be exactly 10 digits']  // ✅ enforce 10 digits
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    match: [/^[A-Za-z ]+$/, 'Name should contain only letters and spaces'] // ✅ strict
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [100, 'Location cannot exceed 100 characters'],
    match: [/^[A-Za-z ,.-]+$/, 'Location can only contain letters, spaces, commas, hyphens, and periods'] // ✅ location-safe
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18'],
    max: [120, 'Age cannot exceed 120']
  },
  party: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    minlength: [2, 'Party name must be at least 2 characters long'],
    maxlength: [40, 'Party name cannot exceed 40 characters'],
    match: [/^[A-Za-z ]+$/, 'Party name should contain only letters and spaces'] // ✅ strict
  },
}, {
  timestamps: true,
  collection: 'candidatesCollection'
});

// Indexes
candidateSchema.index({ nationalId: 1 });
candidateSchema.index({ name: 'text', party: 'text', location: 'text' });

// Pre-save middleware (auto-trim strings)
candidateSchema.pre('save', function(next) {
  Object.keys(this.schema.paths).forEach(key => {
    if (this.schema.paths[key].instance === 'String' && this[key]) {
      this[key] = this[key].trim();
    }
  });
  next();
});

// Error handling middleware for duplicate NID
candidateSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A candidate with this National ID already exists'));
  } else {
    next(error);
  }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;

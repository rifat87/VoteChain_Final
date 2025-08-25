// import mongoose from 'mongoose';

// const biometricDataSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: 'userType'
//   },
//   userType: {
//     type: String,
//     required: true,
//     enum: ['Voter', 'Candidate']
//   },
//   faceId: {
//     type: String,
//     required: true
//   },
//   fingerprint: {
//     type: String,
//     required: true
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// biometricDataSchema.index({ userId: 1, userType: 1 });
// biometricDataSchema.index({ faceId: 1 });
// biometricDataSchema.index({ fingerprint: 1 });

// const BiometricData = mongoose.model('BiometricData', biometricDataSchema);

// export default BiometricData; 
import Voter from '../models/Voter.js';
import BiometricData from '../models/BiometricData.js';
import { validationResult } from 'express-validator';

// Create a new voter
export const createVoter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nationalId,
      name,
      fathersName,
      mothersName,
      dateOfBirth,
      bloodGroup,
      postOffice,
      postCode,
      location,
      faceId,
      fingerprint
    } = req.body;

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ nationalId });
    if (existingVoter) {
      return res.status(400).json({ message: 'Voter already exists' });
    }

    // Create voter
    const voter = new Voter({
      nationalId,
      name,
      fathersName,
      mothersName,
      dateOfBirth,
      bloodGroup,
      postOffice,
      postCode,
      location
    });

    await voter.save();

    // Store biometric data
    const biometricData = new BiometricData({
      userId: voter._id,
      faceId,
      fingerprint
    });

    await biometricData.save();

    res.status(201).json({
      message: 'Voter created successfully',
      voter,
      biometricData
    });
  } catch (error) {
    console.error('Error creating voter:', error);
    res.status(500).json({ message: 'Error creating voter', error: error.message });
  }
};

// Get all voters
export const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find().sort({ createdAt: -1 });
    res.json(voters);
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ message: 'Error fetching voters', error: error.message });
  }
};

// Get voter by ID
export const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    res.json(voter);
  } catch (error) {
    console.error('Error fetching voter:', error);
    res.status(500).json({ message: 'Error fetching voter', error: error.message });
  }
};

// Get voter profile by wallet address
export const getVoterProfile = async (req, res) => {
  try {
    const voter = await Voter.findOne({ walletAddress: req.query.walletAddress });
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    res.json(voter);
  } catch (error) {
    console.error('Error fetching voter profile:', error);
    res.status(500).json({ message: 'Error fetching voter profile', error: error.message });
  }
};

// Update voter
export const updateVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    const {
      nationalId,
      name,
      fathersName,
      mothersName,
      dateOfBirth,
      bloodGroup,
      postOffice,
      postCode,
      location,
      faceId,
      fingerprint
    } = req.body;

    // Update voter
    voter.nationalId = nationalId || voter.nationalId;
    voter.name = name || voter.name;
    voter.fathersName = fathersName || voter.fathersName;
    voter.mothersName = mothersName || voter.mothersName;
    voter.dateOfBirth = dateOfBirth || voter.dateOfBirth;
    voter.bloodGroup = bloodGroup || voter.bloodGroup;
    voter.postOffice = postOffice || voter.postOffice;
    voter.postCode = postCode || voter.postCode;
    voter.location = location || voter.location;

    await voter.save();

    // Update biometric data if provided
    if (faceId || fingerprint) {
      const biometricData = await BiometricData.findOne({ userId: voter._id });
      if (biometricData) {
        biometricData.faceId = faceId || biometricData.faceId;
        biometricData.fingerprint = fingerprint || biometricData.fingerprint;
        await biometricData.save();
      }
    }

    res.json({
      message: 'Voter updated successfully',
      voter
    });
  } catch (error) {
    console.error('Error updating voter:', error);
    res.status(500).json({ message: 'Error updating voter', error: error.message });
  }
};

// Delete voter
export const deleteVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    // Delete biometric data
    await BiometricData.deleteOne({ userId: voter._id });

    // Delete voter
    await voter.deleteOne();

    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    console.error('Error deleting voter:', error);
    res.status(500).json({ message: 'Error deleting voter', error: error.message });
  }
};

export default {
  createVoter,
  getAllVoters,
  getVoterById,
  getVoterProfile,
  updateVoter,
  deleteVoter
}; 
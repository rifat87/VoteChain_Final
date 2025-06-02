import Voter from '../models/Voter.js';
import { validationResult } from 'express-validator';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate face ID from captured images
function generateFaceId(nid) {
    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);
    
    try {
        // Check if directory exists
        if (!fs.existsSync(datasetPath)) {
            console.error(`Dataset directory not found: ${datasetPath}`);
            return null;
        }

        // Read all face images and create a hash
        const files = fs.readdirSync(datasetPath);
        const imageFiles = files.filter(file => file.endsWith('.jpg'));
        
        if (imageFiles.length === 0) {
            console.error(`No face images found in directory: ${datasetPath}`);
            return null;
        }

        console.log(`Found ${imageFiles.length} face images in ${datasetPath}`);
        
        const imageData = imageFiles
            .map(file => {
                const filePath = path.join(datasetPath, file);
                console.log(`Reading image: ${filePath}`);
                return fs.readFileSync(filePath);
            })
            .join('');
        
        const faceId = createHash('sha256').update(imageData).digest('hex');
        console.log(`Generated face ID: ${faceId}`);
        return faceId;
    } catch (error) {
        console.error('Error generating face ID:', error);
        return null;
    }
}

// Get face hash by national ID
const getFaceHash = async (req, res) => {
    try {
        const { nid } = req.params;
        console.log(`Generating face hash for NID: ${nid}`);

        // Generate face ID from captured images
        const faceId = generateFaceId(nid);
        if (!faceId) {
            return res.status(404).json({
                success: false,
                message: 'Failed to generate face ID from captured images'
            });
        }

        res.json({
            success: true,
            faceHash: faceId
        });
    } catch (error) {
        console.error('Error getting face hash:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting face hash',
            error: error.message
        });
    }
};

// Create a new voter
const createVoter = async (req, res) => {
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
      walletAddress,
      blockchainId
    } = req.body;

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ 
      $or: [
        { nationalId },
        { blockchainId }
      ]
    });
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
      location,
      faceId,
      walletAddress,
      blockchainId,
      isRegistered: true,
      isVerified: true,
      verificationStatus: 'approved'
    });

    await voter.save();

    res.status(201).json({
      message: 'Voter created successfully',
      voter
    });
  } catch (error) {
    console.error('Error creating voter:', error);
    res.status(500).json({ message: 'Error creating voter', error: error.message });
  }
};

// Get all voters
const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find().sort({ createdAt: -1 });
    res.json(voters);
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ message: 'Error fetching voters', error: error.message });
  }
};

// Get voter by ID
const getVoterById = async (req, res) => {
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
const getVoterProfile = async (req, res) => {
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
const updateVoter = async (req, res) => {
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
      walletAddress,
      blockchainId
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
    voter.faceId = faceId || voter.faceId;
    voter.walletAddress = walletAddress || voter.walletAddress;
    voter.blockchainId = blockchainId || voter.blockchainId;

    await voter.save();

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
const deleteVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

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
  deleteVoter,
  getFaceHash
}; 
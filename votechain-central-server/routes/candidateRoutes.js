import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import Candidate from '../models/Candidate.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ======================
 * Candidate Endpoints
 * ======================
 */

// @route   POST /api/candidates/register
// @desc    Register new candidate (MongoDB)
// @access  Admin only (frontend checks admin before calling)
router.post('/register', async (req, res) => {
  try {
    const candidateData = req.body;
    console.log('Received candidate data:', candidateData);

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      data: candidate
    });
  } catch (error) {
    console.error('Error saving candidate:', error);

    if (error.name === 'ValidationError') {
      // ✅ Handle schema validation errors (e.g., regex/length failures)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      // ✅ Handle duplicate NID error
      return res.status(400).json({
        success: false,
        message: 'A candidate with this National ID already exists'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to register candidate',
      error: error.message
    });
  }
});


// @route   GET /api/candidates
// @desc    Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate by Mongo ID
router.get('/:id',
  [param('id').isMongoId().withMessage('Invalid candidate ID')],
  validate,
  async (req, res) => {
    try {
      const candidate = await Candidate.findById(req.params.id);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/candidates/:id
// @desc    Update candidate
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid candidate ID'),
    body('name').optional().trim().notEmpty(),
    body('party').optional().trim().notEmpty(),
    body('nationalId').optional().trim().notEmpty(),
    body('age').optional().isInt({ min: 18, max: 120 }),
    body('location').optional().trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate
router.delete('/:id',
  [param('id').isMongoId().withMessage('Invalid candidate ID')],
  validate,
  async (req, res) => {
    try {
      const candidate = await Candidate.findByIdAndDelete(req.params.id);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * ======================
 * Biometric: Face Training
 * ======================
 */

// @route   POST /api/candidates/train-face/:nid
// @desc    Train face recognition model for candidate NID
router.post('/train-face/:nid', async (req, res) => {
  try {
    const { nid } = req.params;
    console.log(`[Train Face] Starting face training for NID: ${nid}`);

    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);

    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({
        success: false,
        message: 'Face images not found. Please capture face images first.'
      });
    }

    const imageFiles = fs.readdirSync(datasetPath).filter(file => file.endsWith('.jpg'));
    if (imageFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No face images found. Please capture face images first.'
      });
    }

    console.log(`[Train Face] Found ${imageFiles.length} face images for training`);

    // Import spawn dynamically
    const { spawn } = await import('child_process');

    // Run train_faces.py script
    const trainScript = path.join(faceRecognitionPath, 'train_faces.py');
    console.log(`[Train Face] Running training script: ${trainScript}`);

    const trainProcess = spawn('python', [trainScript], {
      cwd: faceRecognitionPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    trainProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`[Train Face] Training output: ${message}`);
      output += message;
    });

    trainProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Train Face] Training error: ${error}`);
      errorOutput += error;
    });

    trainProcess.on('close', (code) => {
      console.log(`[Train Face] Training process finished with code: ${code}`);

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: 'Face training failed',
          error: errorOutput,
          code: code
        });
      }

      res.json({
        success: true,
        message: 'Face training completed successfully',
        output: output,
        nid: nid
      });
    });

    trainProcess.on('error', (error) => {
      console.error(`[Train Face] Process error: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to start training process',
        error: error.message
      });
    });

  } catch (error) {
    console.error('Error in train-face endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to train face model',
      error: error.message
    });
  }
});

export default router;

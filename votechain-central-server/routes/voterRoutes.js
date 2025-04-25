import express from 'express';
import voterController from '../controllers/voterController.js';
import {
  createVoterValidation,
  updateVoterValidation,
  getVoterByIdValidation,
  getVoterByWalletValidation,
  deleteVoterValidation
} from '../middleware/validators/voterValidator.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Create a new voter
router.post(
  '/',
  createVoterValidation,
  validate,
  voterController.createVoter
);

// Get all voters
router.get('/', voterController.getAllVoters);

// Get voter by ID
router.get(
  '/voter',
  getVoterByIdValidation,
  validate,
  voterController.getVoterById
);

// Get voter profile by wallet address
router.get(
  '/profile',
  getVoterByWalletValidation,
  validate,
  voterController.getVoterProfile
);

// Update voter
router.put(
  '/voter',
  updateVoterValidation,
  validate,
  voterController.updateVoter
);

// Delete voter
router.delete(
  '/voter',
  deleteVoterValidation,
  validate,
  voterController.deleteVoter
);

export default router; 
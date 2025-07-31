import express from 'express';
import { verifyFace, verifyFingerprint, castVote } from '../controllers/voteController.js';

const router = express.Router();

// Verify voter via face recognition and retrieve voter info (NID etc.)
router.post('/verify-face', verifyFace);

// Mock fingerprint verification
router.post('/verify-fingerprint', verifyFingerprint);

// Cast vote (stub for now)
router.post('/cast', castVote);

// Health check route
router.get('/', (req, res) => {
    res.json({ message: 'Vote routes working' });
});

export default router; 
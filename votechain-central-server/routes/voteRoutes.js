import express from 'express';
const router = express.Router();

// TODO: Implement vote routes
router.get('/', (req, res) => {
    res.json({ message: 'Vote routes working' });
});

export default router; 
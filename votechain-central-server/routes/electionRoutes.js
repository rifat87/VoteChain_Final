import express from 'express';
const router = express.Router();

// TODO: Implement election routes
router.get('/', (req, res) => {
    res.json({ message: 'Election routes working' });
});

export default router; 
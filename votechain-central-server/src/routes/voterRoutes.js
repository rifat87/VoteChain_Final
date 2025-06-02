import express from 'express';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate face ID from captured images
function generateFaceId(nid) {
    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);
    
    console.log('Current directory:', __dirname);
    console.log('Face recognition path:', faceRecognitionPath);
    console.log('Dataset path:', datasetPath);
    
    try {
        // Check if directory exists
        if (!fs.existsSync(datasetPath)) {
            console.error(`Dataset directory not found: ${datasetPath}`);
            return null;
        }

        // Read all face images and create a hash
        const files = fs.readdirSync(datasetPath);
        console.log('All files in directory:', files);
        
        const imageFiles = files.filter(file => file.endsWith('.jpg'));
        console.log('Image files:', imageFiles);
        
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
router.get('/face-hash/:nid', async (req, res) => {
    try {
        const { nid } = req.params;
        const faceId = generateFaceId(nid);
        
        if (!faceId) {
            return res.status(404).json({
                success: false,
                message: 'Face hash not found for this National ID'
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
            message: 'Failed to get face hash',
            error: error.message
        });
    }
});

export default router; 
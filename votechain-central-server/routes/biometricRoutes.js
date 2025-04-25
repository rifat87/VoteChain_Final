import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Implement biometric routes
router.get('/', (req, res) => {
    res.json({ message: 'Biometric routes working' });
});

router.post('/capture-face', async (req, res) => {
    const { nid } = req.body;

    if (!nid) {
        return res.status(400).json({ success: false, message: 'NID is required' });
    }

    let responseSent = false;

    try {
        // Path to the face recognition directory
        const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
        
        // Run the dataset.py script with python command (not python3)
        const pythonProcess = spawn('python', ['dataset.py', nid], {
            cwd: faceRecognitionPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        // Collect stdout data
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Python stdout: ${data}`);
        });

        // Collect stderr data
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
            console.error(`Python stderr: ${data}`);
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            
            if (!responseSent) {
                if (code === 0) {
                    res.json({ 
                        success: true, 
                        message: 'Face captured successfully',
                        output: output
                    });
                } else {
                    res.status(500).json({ 
                        success: false, 
                        message: `Face capture failed: ${error || 'Unknown error'}`,
                        output: output,
                        error: error
                    });
                }
                responseSent = true;
            }
        });

        // Handle process errors
        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            if (!responseSent) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Failed to start face capture process',
                    error: err.message
                });
                responseSent = true;
            }
        });

    } catch (error) {
        console.error('Error in face capture:', error);
        if (!responseSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to start face capture process',
                error: error.message
            });
            responseSent = true;
        }
    }
});

export default router; 
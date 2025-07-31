// verifyFace endpoint implementation
import Voter from '../models/Voter.js';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateFaceId(nid) {
    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);

    try {
        if (!fs.existsSync(datasetPath)) {
            return null;
        }
        const files = fs.readdirSync(datasetPath).filter((f) => f.endsWith('.jpg'));
        if (files.length === 0) return null;
        const imageData = files
            .map((file) => fs.readFileSync(path.join(datasetPath, file)))
            .join('');
        return createHash('sha256').update(imageData).digest('hex');
    } catch (error) {
        console.error('[VoteController] generateFaceId error:', error);
        return null;
    }
}

export const verifyFace = async (req, res) => {
    try {
        console.log('[VoteController] Starting face verification...');
        const faceRecPath = path.join(__dirname, '../../votechain-face-recognition', 'face_rec_demo.py');
        const faceRecDir = path.dirname(faceRecPath);

        if (!fs.existsSync(faceRecPath)) {
            return res.status(500).json({
                success: false,
                message: 'Face recognition script not found',
            });
        }

        const pythonProcess = spawn('python', [faceRecPath], {
            cwd: faceRecDir,
            timeout: 15000,
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdout += chunk;
            console.log('[VoteController] python stdout:', chunk.trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderr += chunk;
            console.error('[VoteController] python stderr:', chunk.trim());
        });

        pythonProcess.on('close', async (code) => {
            console.log(`[VoteController] face recognition exited with code ${code}`);

            if (code !== 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Face recognition process failed',
                    error: stderr || 'Unknown error',
                });
            }

            const outputLower = stdout.toLowerCase();
            const isSuccess = outputLower.includes('face recognition successful') || outputLower.includes('result = success');

            if (!isSuccess) {
                return res.json({
                    success: false,
                    message: 'Face not recognised',
                    details: stdout.trim(),
                });
            }

            // Attempt to extract matched ID (assuming "Matched ID: <id>" in stdout)
            const idMatch = stdout.match(/Matched ID:\s*([\w-]+)/i);
            const matchedNid = idMatch ? idMatch[1].trim() : null;

            if (!matchedNid) {
                return res.json({
                    success: true,
                    message: 'Face verified but could not extract NID',
                    details: stdout.trim(),
                });
            }
            // @audit 
            // Generate faceId from dataset and lookup voter
            const faceId = generateFaceId(matchedNid);
            let voter = null;
            if (faceId) {
                voter = await Voter.findOne({ faceId });
            }

            if (!voter) {
                voter = await Voter.findOne({ nationalId: matchedNid });
            }

            if (!voter) {
                return res.status(404).json({
                    success: false,
                    message: 'Voter not found in database',
                    matchedNid,
                });
            }

            res.json({
                success: true,
                message: `Face verified for NID ${voter.nationalId}`,
                voter: {
                    id: voter._id,
                    nationalId: voter.nationalId,
                    name: voter.name,
                    location: voter.location,
                },
                faceId,
            });
        });

        pythonProcess.on('error', (error) => {
            console.error('[VoteController] Failed to start python:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to launch face recognition',
                error: error.message,
            });
        });
    } catch (error) {
        console.error('[VoteController] verifyFace error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

export const castVote = async (req, res) => {
    // Placeholder function – to be implemented later
    res.json({ message: 'Cast vote endpoint (stub)' });
};

// TEMP: mocked fingerprint verification endpoint
export const verifyFingerprint = async (req, res) => {
    try {
        console.log('[VoteController] Mock fingerprint verification');
        // Simulate async delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return mock voter data (would be looked up via fingerprint hash)
        res.json({
            success: true,
            voter: {
                nationalId: 'MOCK-NID-123456',
            },
            message: 'Fingerprint verified (mock)'
        });
    } catch (error) {
        console.error('Fingerprint verification error:', error);
        res.status(500).json({ success: false, message: 'Fingerprint verification failed', error: error.message });
    }
};

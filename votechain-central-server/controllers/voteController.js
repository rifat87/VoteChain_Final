// verifyFace endpoint implementation
import Voter from '../models/Voter.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Verify face using Python script
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
      const isSuccess =
        outputLower.includes('face recognition successful') ||
        outputLower.includes('result = success');

      if (!isSuccess) {
        return res.json({
          success: false,
          message: 'Face not recognised',
          details: stdout.trim(),
        });
      }

      // ✅ Extract matched NID from stdout
      const idMatch = stdout.match(/Matched ID:\s*([\w-]+)/i);
      const matchedNid = idMatch ? idMatch[1].trim() : null;

      if (!matchedNid) {
        return res.json({
          success: true,
          message: 'Face verified but could not extract NID',
          details: stdout.trim(),
        });
      }

      // ✅ Lookup voter by NID
      const voter = await Voter.findOne({ nationalId: matchedNid });
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

// 🔹 Cast vote placeholder
export const castVote = async (req, res) => {
  res.json({ message: 'Cast vote endpoint (stub)' });
};

// 🔹 Mock fingerprint verification (replace with real later)
export const verifyFingerprint = async (req, res) => {
  try {
    console.log('[VoteController] Mock fingerprint verification');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      voter: {
        nationalId: 'MOCK-NID-123456',
      },
      message: 'Fingerprint verified (mock)',
    });
  } catch (error) {
    console.error('Fingerprint verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Fingerprint verification failed',
      error: error.message,
    });
  }
};

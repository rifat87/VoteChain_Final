import Voter from '../models/Voter.js'
import { validationResult } from 'express-validator'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// -----------------------------
// Train face by national ID
// -----------------------------
const handleTrainFace = async (req, res) => {
  try {
    const { nid } = req.params
    console.log(`[Train Face] Starting face training for NID: ${nid}`)

    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition')
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid)

    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({
        success: false,
        message: 'Face images not found. Please capture face images first.'
      })
    }

    const imageFiles = fs.readdirSync(datasetPath).filter(file => file.endsWith('.jpg'))
    if (imageFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No face images found. Please capture face images first.'
      })
    }

    console.log(`[Train Face] Found ${imageFiles.length} face images for training`)

    const trainScript = path.join(faceRecognitionPath, 'train_faces.py')
    console.log(`[Train Face] Running training script: ${trainScript}`)

    const trainProcess = spawn('python', [trainScript], {
      cwd: faceRecognitionPath,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let errorOutput = ''

    trainProcess.stdout.on('data', (data) => {
      const message = data.toString()
      console.log(`[Train Face] Training output: ${message}`)
      output += message
    })

    trainProcess.stderr.on('data', (data) => {
      const error = data.toString()
      console.error(`[Train Face] Training error: ${error}`)
      errorOutput += error
    })

    trainProcess.on('close', (code) => {
      console.log(`[Train Face] Training process finished with code: ${code}`)

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: 'Face training failed',
          error: errorOutput,
          code: code
        })
      }

      res.json({
        success: true,
        message: 'Face training completed successfully',
        output: output,
        nid: nid
      })
    })

    trainProcess.on('error', (error) => {
      console.error(`[Train Face] Process error: ${error}`)
      res.status(500).json({
        success: false,
        message: 'Failed to start training process',
        error: error.message
      })
    })

  } catch (error) {
    console.error('Error in train-face endpoint:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to train face model',
      error: error.message
    })
  }
}

// -----------------------------
// Create a new voter
// -----------------------------
const createVoter = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      })
    }

    const { nationalId, name, dateOfBirth, location } = req.body

    // Extra duplicate safety
    const existingVoter = await Voter.findOne({ nationalId })
    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'A voter with this National ID already exists'
      })
    }

    const voter = new Voter({ nationalId, name, dateOfBirth, location })
    await voter.save()
    
    res.status(201).json({
      success: true,
      message: 'Voter created successfully',
      voter
    })
  } catch (error) {
    console.error('Error creating voter:', error)

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A voter with this National ID already exists'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error creating voter',
      error: error.message
    })
  }
}

// -----------------------------
// Get all voters
// -----------------------------
const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find().sort({ createdAt: -1 })
    res.json(voters)
  } catch (error) {
    console.error('Error fetching voters:', error)
    res.status(500).json({ message: 'Error fetching voters', error: error.message })
  }
}

// -----------------------------
// Get voter by MongoDB ID
// -----------------------------
const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id)
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' })
    }
    res.json(voter)
  } catch (error) {
    console.error('Error fetching voter:', error)
    res.status(500).json({ message: 'Error fetching voter', error: error.message })
  }
}

// -----------------------------
// Update voter
// -----------------------------
const updateVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id)
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' })
    }

    const { nationalId, name, dateOfBirth, location } = req.body

    voter.nationalId = nationalId || voter.nationalId
    voter.name = name || voter.name
    voter.dateOfBirth = dateOfBirth || voter.dateOfBirth
    voter.location = location || voter.location

    await voter.save()

    res.json({
      message: 'Voter updated successfully',
      voter
    })
  } catch (error) {
    console.error('Error updating voter:', error)
    res.status(500).json({ message: 'Error updating voter', error: error.message })
  }
}

// -----------------------------
// Delete voter
// -----------------------------
const deleteVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.query.id)
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' })
    }

    await voter.deleteOne()
    res.json({ message: 'Voter deleted successfully' })
  } catch (error) {
    console.error('Error deleting voter:', error)
    res.status(500).json({ message: 'Error deleting voter', error: error.message })
  }
}

export default {
  createVoter,
  getAllVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  handleTrainFace
}

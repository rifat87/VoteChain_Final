import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

let serial
let parser

// Initialize serial connection (singleton)
function initSerial() {
  if (!serial) {
    console.log("[Serial] Initializing serial connection on COM9...")
    serial = new SerialPort({ path: 'COM9', baudRate: 57600 })
    parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }))

    serial.on('open', () => {
      console.log("[Serial] Serial port COM4 opened successfully.")
    })

    serial.on('error', (err) => {
      console.error("[Serial] Serial port error:", err.message)
    })
  }
}

// Send command and wait for relevant sensor response
function sendSerialCommand(command, matchCondition = null) {
  return new Promise((resolve, reject) => {
    initSerial()

    let response = ''
    console.log(`[Serial] Sending command: ${command}`)

    const onData = (data) => {
      const cleanData = data.trim()
      console.log(`[Serial] Received data: ${cleanData}`)
      response += cleanData

      if (
        (matchCondition && matchCondition(cleanData)) ||
        cleanData.includes('SUCCESS') ||
        cleanData.includes('DETECTED') ||
        cleanData.includes('ERROR')
      ) {
        parser.removeListener('data', onData)
        console.log(`[Serial] Final response: ${response}`)
        resolve(response)
      }
    }

    parser.on('data', onData)

    serial.write(`${command}\n`, (err) => {
      if (err) {
        parser.removeListener('data', onData)
        console.error("[Serial] Failed to write to serial port:", err.message)
        reject(err)
      } else {
        console.log(`[Serial] Command '${command}' sent successfully.`)
      }
    })
  })
}

const captureFingerprint = async (req, res) => {
  console.log("[API] /api/fingerprint/enroll called")

  try {
    const result = await sendSerialCommand("ENROLL")
    console.log("[API] ENROLL result:", result)

    if (result.includes("SUCCESS")) {
      const idMatch = result.match(/ID\s(\d+)/)
      const fingerId = idMatch ? parseInt(idMatch[1], 10) : null
      console.log(`[API] Fingerprint enrolled at ID ${fingerId}`)

      // ✅ Stop sensor after successful enrollment
      try {
        await sendSerialCommand("STOP", (data) => data.includes("Stopped"))
      } catch {
        console.warn("[API] STOP after ENROLL failed. Ignoring.")
      }

      return res.status(200).json({ success: true, message: result, fingerId })
    }

    console.warn("[API] Enrollment failed:", result)
    return res.status(400).json({ success: false, message: result })

  } catch (error) {
    console.error("[API] Enrollment error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

const detectFingerprint = async (req, res) => {
  console.log("[API] /api/fingerprint/detect called")

  try {
    const result = await sendSerialCommand("DETECT")
    console.log("[API] DETECT result:", result)

    if (result.includes('DETECTED')) {
      const idMatch = result.match(/ID\s(\d+)/)
      const fingerId = idMatch ? parseInt(idMatch[1], 10) : null
      console.log(`[API] Fingerprint detected: ID ${fingerId}`)

      // ✅ Stop sensor after successful detection
      try {
        await sendSerialCommand("STOP", (data) => data.includes("Stopped"))
      } catch {
        console.warn("[API] STOP after DETECT failed. Ignoring.")
      }

      if (!fingerId) {
        return res.status(400).json({ success: false, message: "Invalid fingerprint ID detected" })
      }

      return res.status(200).json({ success: true, message: result, fingerId })
    }

    console.warn("[API] Detection failed:", result)
    return res.status(400).json({ success: false, message: result })

  } catch (error) {
    console.error("[API] Detection error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

const formatFingerprintDatabase = async (req, res) => {
    console.log("[API] /api/fingerprint/format called")
  
    try {
      const result = await sendSerialCommand("FORMAT", (data) =>
        data.includes('"status":"success"')
      )
  
      console.log("[API] FORMAT result:", result)
      return res.status(200).json({ success: true, message: "Fingerprint database cleared." })
    } catch (error) {
      console.error("[API] Format error:", error.message)
      return res.status(500).json({
        success: false,
        error: "Failed to clear fingerprint database. Please try again.",
      })
    }
}
  

export default {
  captureFingerprint,
  detectFingerprint,
  formatFingerprintDatabase
}

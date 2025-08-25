
// ... updated code:
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'


let parser
let serial
function initSerial() {
  if (!serial) {
    console.log("[Serial] Initializing serial connection on COM9...")
    serial = new SerialPort({ path: 'COM9', baudRate: 115200 })
    parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }))

    serial.on('open', () => {
      console.log("[Serial] Serial port COM9 opened successfully.")
    })

    serial.on('error', (err) => {
      console.error("[Serial] Serial port error:", err.message)
    })
  }
}

function sendSerialJSON(obj) {
  return new Promise((resolve, reject) => {
    initSerial()

    const jsonStr = JSON.stringify(obj)
    console.log(`[Serial] Sending JSON command: ${jsonStr}`)

    const onData = (data) => {
      const clean = data.trim()
      console.log(`[Serial] Received data: ${clean}`)
      try {
        const parsed = JSON.parse(clean)
        // Assume ESP32 always responds once per command
        parser.removeListener('data', onData)
        resolve(parsed)
      } catch {
        console.warn("[Serial] Ignored non-JSON data")
      }
    }

    parser.on('data', onData)

    serial.write(jsonStr + "\n", (err) => {
      if (err) {
        parser.removeListener('data', onData)
        console.error("[Serial] Failed to write to serial port:", err.message)
        reject(err)
      } else {
        console.log("[Serial] Command sent successfully.")
      }
    })
  })
}

// ================== API Controllers ==================

// ENROLL
const captureFingerprint = async (req, res) => {
  console.log("[API] /api/fingerprint/enroll called")
  const { nid } = req.body
  if (!nid) {
    return res.status(400).json({ success: false, message: "NID is required" })
  }

  try {
    const response = await sendSerialJSON({ cmd: "ENROLL", nid })
    console.log("[API] ENROLL result:", response)

    if (response.status === "success" && response.action === "enroll") {
      return res.status(200).json({
        success: true,
        nid: response.nid,
        message: "Fingerprint enrollment successful"
      })
    }

    return res.status(400).json({
      success: false,
      nid: response.nid || null,
      message: response.message || "Enrollment failed"
    })
  } catch (error) {
    console.error("[API] Enrollment error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// DETECT
const detectFingerprint = async (req, res) => {
  console.log("[API] /api/fingerprint/detect called")
  try {
    const response = await sendSerialJSON({ cmd: "DETECT" })
    console.log("[API] DETECT result:", response)

    if (response.status === "success" && response.action === "detect" && response.nid) {
      return res.status(200).json({
        success: true,
        nid: response.nid,
        message: "Fingerprint match successful"
      })
    }

    return res.status(400).json({
      success: false,
      nid: response.nid || null,
      message: response.message || "No match found"
    })
  } catch (error) {
    console.error("[API] Detection error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// Optional: Format DB (if your ESP32 firmware supports it)
const formatFingerprintDatabase = async (req, res) => {
  console.log("[API] /api/fingerprint/format called")
  try {
    const response = await sendSerialJSON({ cmd: "FORMAT" })
    console.log("[API] FORMAT result:", response)

    if (response.status === "success") {
      return res.status(200).json({ success: true, message: "Fingerprint database cleared" })
    }

    return res.status(400).json({ success: false, message: response.message || "Format failed" })
  } catch (error) {
    console.error("[API] Format error:", error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

export default {
  captureFingerprint,
  detectFingerprint,
  formatFingerprintDatabase,
}

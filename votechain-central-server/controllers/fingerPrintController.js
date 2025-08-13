import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

let serial
let parser

function initSerial() {
  if (!serial) {
    console.log("[Serial] Initializing serial connection on COM9...")
    serial = new SerialPort({ path: 'COM9', baudRate: 57600 })
    parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }))

    serial.on('open', () => {
      console.log("[Serial] Serial port COM 9 opened successfully.")
    })

    serial.on('error', (err) => {
      console.error("[Serial] Serial port error:", err.message)
    })
  }
}

function sendSerialCommand(command, matchCondition = null) {
  return new Promise((resolve, reject) => {
    initSerial()

    console.log(`[Serial] Sending command: ${command}`)

    const onData = (data) => {
      const clean = data.trim()
      console.log(`[Serial] Received data: ${clean}`)

      let isMatch = false

      try {
        const json = JSON.parse(clean)
        const status = json.status?.toLowerCase()

        isMatch =
          (matchCondition && matchCondition(clean)) ||
          status === 'success' ||
          status === 'error'
      } catch (e) {
        console.warn("[Serial] Ignored non-JSON or malformed data")
      }

      if (isMatch) {
        parser.removeListener('data', onData)
        console.log(`[Serial] Final response: ${clean}`)
        resolve(clean)
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

    const lower = result.toLowerCase()
    if (lower.includes('"status":"success"') && lower.includes('"action":"enroll"')) {
      const json = JSON.parse(result)
      const fingerId = json.id
      console.log(`[API] Fingerprint enrolled at ID ${fingerId}`)

      try {
        await sendSerialCommand("STOP", (data) =>
          data.toLowerCase().includes("stopped")
        )
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

    const lower = result.toLowerCase()
    if (lower.includes('"status":"success"') && lower.includes('"action":"detect"')) {
      const json = JSON.parse(result)
      const fingerId = json.id
      console.log(`[API] Fingerprint detected: ID ${fingerId}`)

      try {
        await sendSerialCommand("STOP", (data) =>
          data.toLowerCase().includes("stopped")
        )
      } catch {
        console.warn("[API] STOP after DETECT failed. Ignoring.")
      }

      if (fingerId == null) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid fingerprint ID detected" })
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
    const result = await sendSerialCommand(
      "FORMAT",
      (data) => data.toLowerCase().includes('"status":"success"')
    )
    console.log("[API] FORMAT result:", result)
    return res
      .status(200)
      .json({ success: true, message: "Fingerprint database cleared." })
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
  formatFingerprintDatabase,
}

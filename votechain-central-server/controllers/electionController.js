import { getContract } from "../utils/contract.js"

const getElectionData = async (req, res) => {
  try {
    const contract = getContract()

    // Fetch all candidates
    const candidates = await contract.getCandidates()

    // Normalize candidates into plain JS objects
    const processed = candidates.map((c) => ({
      nationalId: c.nationalId,
      name: c.name,
      location: c.location,
      age: Number(c.age),
      party: c.party,
      voteCount: Number(c.voteCount),
    }))

    res.json({
      count: processed.length,
      candidates: processed,
    })
  } catch (err) {
    console.error("Error fetching public election data:", err)
    res.status(500).json({ error: "Failed to fetch election data" })
  }
}

export default {
  getElectionData,
}

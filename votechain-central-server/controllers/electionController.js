import { getContract } from '../utils/contract.js'

const getElectionData = async (req, res) => {
    try {
        const contract = getContract() // use same ABI & address as usual
  
      const [ended, count, candidates] = await Promise.all([
        contract.electionEnded(),
        contract.candidateCount(),
        contract.getCandidates()
      ])
  
      const processed = candidates.map((c) => ({
        id: Number(c.id),
        name: c.name,
        nationalId: c.nationalId,
        location: c.location,
        voteCount: Number(c.voteCount),
        isVerified: c.isVerified
      }))      
  
      res.json({
        ended,
        count: Number(count),
        candidates: processed
      })
    } catch (err) {
      console.error('Error fetching public election data:', err)
      res.status(500).json({ error: 'Failed to fetch election data' })
    }
}

export default {
    getElectionData,
}
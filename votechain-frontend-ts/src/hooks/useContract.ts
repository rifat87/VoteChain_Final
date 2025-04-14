import { useCallback, useMemo, useRef } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '@/components/ui/wallet-provider'
import { contractAddress, contractABI } from '@/config/contract'

export function useContract() {
  const { provider, signer, isConnected } = useWallet()
  const contractRef = useRef<ethers.Contract | null>(null)

  const contract = useMemo(() => {
    if (!isConnected || !provider || !signer) {
      contractRef.current = null
      return null
    }

    // Only create new contract instance if provider or signer changes
    if (!contractRef.current || 
        contractRef.current.provider !== provider || 
        contractRef.current.signer !== signer) {
      try {
        contractRef.current = new ethers.Contract(contractAddress, contractABI, signer)
      } catch (error) {
        contractRef.current = null
      }
    }

    return contractRef.current
  }, [isConnected, provider, signer])

  const getCandidates = useCallback(async () => {
    if (!contract) return []

    try {
      const count = await contract.candidateCount()
      console.log('Total candidates:', Number(count))
      
      const candidates = []
      for (let i = 1; i <= Number(count); i++) {
        try {
          const candidate = await contract.getCandidate(i)
          console.log(`Candidate ${i}:`, {
            id: Number(candidate.id),
            name: candidate.name,
            voteCount: Number(candidate.voteCount)
          })
          
          candidates.push({
            id: Number(candidate.id),
            name: candidate.name,
            votes: Number(candidate.voteCount)
          })
        } catch (error) {
          console.error(`Error fetching candidate ${i}:`, error)
        }
      }
      
      console.log('All candidates:', candidates)
      return candidates
    } catch (error) {
      console.error('Error in getCandidates:', error)
      return []
    }
  }, [contract])

  const castVote = useCallback(async (candidateId: number) => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tx = await contract.castVote(candidateId)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error casting vote:', error)
      throw error
    }
  }, [contract])

  const isAdmin = useCallback(async (address: string) => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const commissionAddress = await contract.electionCommission()
      return commissionAddress.toLowerCase() === address.toLowerCase()
    } catch (error) {
      console.error('Error checking admin status:', error)
      throw error
    }
  }, [contract])

  const registerVoter = useCallback(async (voterAddress: string) => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tx = await contract.registerVoter(voterAddress)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error registering voter:', error)
      throw error
    }
  }, [contract])

  const registerCandidate = useCallback(async (name: string, party: string) => {
    if (!contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tx = await contract.registerCandidate(name, party)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error registering candidate:', error)
      throw error
    }
  }, [contract])

  return {
    contract,
    getCandidates,
    castVote,
    isAdmin,
    registerVoter,
    registerCandidate
  }
}

// Hook for election state
export function useElectionState() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isElectionEnded, setIsElectionEnded] = useState(false)
  const [candidateCount, setCandidateCount] = useState<number>(0)

  const fetchElectionState = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const [ended, count] = await Promise.all([
        contract.electionEnded(),
        contract.candidateCount()
      ])
      setIsElectionEnded(ended)
      setCandidateCount(Number(count))
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to fetch election state'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    isElectionEnded,
    candidateCount,
    fetchElectionState
  }
}

// Hook for candidate management
export function useCandidates() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [candidates, setCandidates] = useState<Array<{
    id: number
    name: string
    voteCount: number
  }>>([])

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const count = await contract.candidateCount()
      const candidatesData = await Promise.all(
        Array.from({ length: Number(count) }, (_, i) => contract.candidates(i))
      )
      setCandidates(candidatesData.map(c => ({
        id: Number(c.id),
        name: c.name,
        voteCount: Number(c.voteCount)
      })))
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to fetch candidates'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerCandidate = useCallback(async (name: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const tx = await contract.registerCandidate(name)
      await tx.wait()
      await fetchCandidates() // Refresh the list
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to register candidate'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [fetchCandidates])

  return {
    isLoading,
    error,
    candidates,
    fetchCandidates,
    registerCandidate
  }
}

// Hook for voting
export function useVoting() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkVotingStatus = useCallback(async (address: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const [hasVoted, isRegistered] = await Promise.all([
        contract.hasVoted(address),
        contract.registeredVoters(address)
      ])
      return { hasVoted, isRegistered }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to check voting status'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    checkVotingStatus
  }
} 
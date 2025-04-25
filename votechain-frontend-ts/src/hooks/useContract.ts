import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  LOCAL_CONTRACT_ADDRESS,
  LOCAL_CONTRACT_ABI,
  createLocalContract,
  getLocalProvider,
  getLocalSigner
} from '@/local/contracts/local-contract'

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initContract() {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed')
        }

        // Initialize contract with signer for all operations
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = createLocalContract(signer)
        
        setContract(contract)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contract')
      } finally {
        setIsLoading(false)
      }
    }

    initContract()
  }, [])

  // Function to get contract with signer for transactions
  const getContractWithSigner = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return createLocalContract(signer)
  }

  const getCandidates = async () => {
    if (!contract) throw new Error('Contract not initialized')
    return contract.getCandidates()
  }

  const castVote = async (candidateId: number) => {
    const contractWithSigner = await getContractWithSigner()
    const tx = await contractWithSigner.castVote(candidateId)
    const receipt = await tx.wait()
    if (!receipt || !receipt.transactionHash) {
      throw new Error('Failed to get transaction hash from blockchain')
    }
    return receipt
  }

  const isAdmin = async (address: string) => {
    if (!contract) throw new Error('Contract not initialized')
    const commissionAddress = await contract.electionCommission()
    return address.toLowerCase() === commissionAddress.toLowerCase()
  }

  const registerVoter = async (voterAddress: string) => {
    const contractWithSigner = await getContractWithSigner()
    const tx = await contractWithSigner.registerVoter(voterAddress)
    const receipt = await tx.wait()
    if (!receipt || !receipt.transactionHash) {
      throw new Error('Failed to get transaction hash from blockchain')
    }
    return receipt
  }

  const registerCandidate = async (
    name: string,
    nationalId: string,
    location: string
  ) => {
    try {
      const contractWithSigner = await getContractWithSigner()
      console.log('Sending transaction...')
      const tx = await contractWithSigner.registerCandidate(
        name,
        nationalId,
        location
      )
      console.log('Transaction sent:', tx.hash)
      
      console.log('Waiting for transaction to be mined...')
      const receipt = await tx.wait()
      console.log('Transaction mined:', receipt)
      
      if (!receipt || !receipt.hash) {
        throw new Error('Failed to get transaction hash from blockchain')
      }
      
      return receipt
    } catch (error) {
      console.error('Error in registerCandidate:', error)
      throw error
    }
  }

  const startElection = async () => {
    const contractWithSigner = await getContractWithSigner()
    const tx = await contractWithSigner.startElection()
    const receipt = await tx.wait()
    if (!receipt || !receipt.transactionHash) {
      throw new Error('Failed to get transaction hash from blockchain')
    }
    return receipt
  }

  const endElection = async () => {
    const contractWithSigner = await getContractWithSigner()
    const tx = await contractWithSigner.endElection()
    const receipt = await tx.wait()
    if (!receipt || !receipt.transactionHash) {
      throw new Error('Failed to get transaction hash from blockchain')
    }
    return receipt
  }

  const isRegisteredVoter = async (address: string) => {
    if (!contract) throw new Error('Contract not initialized')
    return contract.isRegisteredVoter(address)
  }

  const isVoted = async (address: string) => {
    if (!contract) throw new Error('Contract not initialized')
    return contract.isVoted(address)
  }

  const getVoteCount = async (candidateId: number) => {
    if (!contract) throw new Error('Contract not initialized')
    return contract.getVoteCount(candidateId)
  }

  return {
    contract,
    isLoading,
    error,
    getCandidates,
    castVote,
    isAdmin,
    registerVoter,
    registerCandidate,
    startElection,
    endElection,
    isRegisteredVoter,
    isVoted,
    getVoteCount,
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
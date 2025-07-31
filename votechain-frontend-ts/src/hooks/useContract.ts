import { useEffect, useState, useCallback, useRef } from 'react'
import { ethers } from 'ethers'
import { createContract, getProvider } from '@/config/contract'
import { useWallet } from '@/components/ui/wallet-provider'


export interface Candidate {
  id: number
  name: string
  nationalId: string
  location: string
  voteCount: number
  isVerified: boolean
}

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { isConnected, signer, address } = useWallet()
  const lastAddress = useRef<string | null>(null)

  useEffect(() => {
    // Reset state if disconnected
    if (!isConnected || !address) {
      setContract(null)
      setIsInitialized(false)
      setIsAdmin(false)
      setIsLoading(false)
      lastAddress.current = null
      return
    }
    // Only run if address actually changes
    if (lastAddress.current === address) return
    lastAddress.current = address
    if (!signer) return // Guard: signer must be non-null
    setIsLoading(true)
    setError(null)
    const initializeContract = async () => {
      try {
        const contractInstance = createContract(signer)
        console.log('Contract instance created:', contractInstance)
        setContract(contractInstance)
        const commission = await contractInstance.electionCommission()
        console.log('Election commission:', commission)
        setIsInitialized(commission !== ethers.ZeroAddress)
        setIsAdmin(address.toLowerCase() === commission.toLowerCase())
      } catch (err) {
        console.error('Error initializing contract:', err)
        setError(err as Error)
        setIsInitialized(false)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    initializeContract()
  }, [isConnected, signer, address])

  const getCandidates = useCallback(async (): Promise<Candidate[]> => {
    if (!contract) {
      console.log('Contract not initialized');
      return [];
    }

    try {
      console.log('Using initialized contract for getCandidates');
      console.log('Contract instance:', contract);
      console.log('Contract address:', contract.address);
      
      // Check if contract has candidateCount function
      const count = await contract.candidateCount();
      console.log('Total candidates from contract:', Number(count));
      
      if (Number(count) === 0) {
        console.log('No candidates registered in contract');
        return [];
      }

      // Method 1: Try using getCandidates function (if it exists)
      try {
        console.log('Trying to call getCandidates() function...');
        const allCandidates = await contract.getCandidates();
        console.log('Raw candidates from getCandidates():', allCandidates);
        
        const candidates: Candidate[] = allCandidates.map((candidate: any, index: number) => ({
          id: Number(candidate.id),
          name: candidate.name,
          nationalId: candidate.nationalId,
          location: candidate.location,
          voteCount: Number(candidate.voteCount),
          isVerified: candidate.isVerified
        }));
        
        console.log('Processed candidates array:', candidates);
        return candidates;
      } catch (getCandidatesError) {
        console.log('getCandidates() function failed, trying individual getCandidate calls:', getCandidatesError);
        
        // Method 2: Fallback to individual getCandidate calls
        const candidates: Candidate[] = [];
        for (let i = 1; i <= Number(count); i++) { // Note: starting from 1, not 0
          try {
            console.log(`Fetching candidate ${i}...`);
            const candidate = await contract.getCandidate(i);
            console.log(`Candidate ${i} data:`, candidate);
            
            candidates.push({
              id: Number(candidate.id),
              name: candidate.name,
              nationalId: candidate.nationalId,
              location: candidate.location,
              voteCount: Number(candidate.voteCount),
              isVerified: candidate.isVerified
            });
          } catch (individualError) {
            console.error(`Error fetching candidate ${i}:`, individualError);
          }
        }
        console.log('Final candidates array from individual calls:', candidates);
        return candidates;
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }, [contract]);

  const registerVoter = async (name: string, nationalId: string, location: string, faceHash: string) => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      console.log('Contract:', contract);
      console.log('Signer:', contract.signer);
      console.log('Parameters:', {
        name,
        nationalId,
        location,
        faceHash
      });
      
      const tx = await contract.registerVoter(
        name,
        nationalId,
        location,
        faceHash
      );
      console.log('Transaction sent:', tx);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('Transaction receipt:', receipt)
      
      // Verify transaction was successful
      if (receipt.status === 0) {
        throw new Error('Transaction failed on blockchain')
      }

      return receipt.hash
    } catch (error) {
      console.error("Error registering voter:", error);
      throw error;
    }
  }

  const castVote = async (candidateId: number, voterNID: string) => {
    if (!contract) throw new Error('Contract not initialized')
    try {
      const tx = await contract.castVote(candidateId, voterNID)
      await tx.wait()
    } catch (error) {
      console.error('Error casting vote:', error)
      throw error
    }
  }

  const registerCandidate = async (name: string, nationalId: string, location: string, faceHash: string) => {
    if (!contract) throw new Error("Contract not initialized");
    try {
      console.log('Contract:', contract);
      console.log('Signer:', contract.signer);
      console.log('Parameters:', {
        name,
        nationalId,
        location,
        faceHash
      });
      
      // Call the contract function with the string parameter
      const tx = await contract.registerCandidate(
        name,
        nationalId,
        location,
        faceHash
      );
      console.log('Transaction sent:', tx);
      return tx;
    } catch (error) {
      console.error("Error registering candidate:", error);
      throw error;
    }
  };

  const endElection = async () => {
    if (!contract) throw new Error('Contract not initialized')
    const tx = await contract.endElection()
    await tx.wait()
  }

  return {
    contract,
    isLoading,
    error,
    isInitialized,
    isAdmin,
    getCandidates,
    registerVoter,
    castVote,
    registerCandidate,
    endElection
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
      const provider = getProvider()
      const contract = createContract(await provider.getSigner())
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
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const provider = getProvider()
      const contract = createContract(await provider.getSigner())
      const candidates = await contract.getCandidates()
      setCandidates(candidates.map((c: any) => ({
        id: Number(c.id),
        name: c.name,
        nationalId: c.nationalId,
        location: c.location,
        voteCount: Number(c.voteCount),
        isVerified: c.isVerified
      })))
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to fetch candidates'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerCandidate = useCallback(async (name: string, nationalId: string, location: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const provider = getProvider()
      const contract = createContract(await provider.getSigner())
      const tx = await contract.registerCandidate(name, nationalId, location)
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
      const provider = getProvider()
      const contract = createContract(await provider.getSigner())
      const [hasVoted, isRegistered] = await Promise.all([
        contract.isVoted(address),
        contract.isRegisteredVoter(address)
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
import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { getContract, Contract } from '@/utils/contract'

interface ContractState {
  isLoading: boolean
  error: Error | null
  contract: Contract | null
}

export function useContract() {
  const [state, setState] = useState<ContractState>({
    isLoading: true,
    error: null,
    contract: null
  })

  const initializeContract = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const contract = await getContract()
      setState(prev => ({ ...prev, contract, isLoading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to initialize contract'),
        isLoading: false
      }))
    }
  }, [])

  return {
    ...state,
    initializeContract
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
        Array.from({ length: Number(count) }, (_, i) => contract.getCandidate(i))
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

  const castVote = useCallback(async (candidateId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const tx = await contract.castVote(candidateId)
      await tx.wait()
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to cast vote'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    castVote,
    checkVotingStatus
  }
} 
import { useEffect, useState, useCallback, useRef } from "react"
import { ethers } from "ethers"
import { createContract, getProvider } from "@/config/contract"
import { useWallet } from "@/components/ui/wallet-provider"

// Match Solidity struct
export interface Candidate {
  nationalId: string
  name: string
  location: string
  age: number
  party: string
  voteCount: number
}

export interface Voter {
  nationalId: string
  name: string
  location: string
  birthDate: string
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
    if (!isConnected || !address) {
      setContract(null)
      setIsInitialized(false)
      setIsAdmin(false)
      setIsLoading(false)
      lastAddress.current = null
      return
    }
    if (lastAddress.current === address) return
    lastAddress.current = address
    if (!signer) return

    setIsLoading(true)
    setError(null)

    const initializeContract = async () => {
      try {
        const contractInstance = createContract(signer)
        setContract(contractInstance)
        const commission = await contractInstance.electionCommission()
        setIsInitialized(commission !== ethers.ZeroAddress)
        setIsAdmin(address.toLowerCase() === commission.toLowerCase())
      } catch (err) {
        setError(err as Error)
        setIsInitialized(false)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    initializeContract()
  }, [isConnected, signer, address])

  // Fetch all candidates
  const getCandidates = useCallback(async (): Promise<Candidate[]> => {
    if (!contract) return []
    try {
      const allCandidates = await contract.getCandidates()
      return allCandidates.map((c: any) => ({
        nationalId: c.nationalId,
        name: c.name,
        location: c.location,
        age: Number(c.age),
        party: c.party,
        voteCount: Number(c.voteCount),
      }))
    } catch (error) {
      console.error("Error fetching candidates:", error)
      throw error
    }
  }, [contract])

  // Register voter
  const registerVoter = async (
    name: string,
    nationalId: string,
    location: string,
    birthDate: string
  ) => {
    if (!contract) throw new Error("Contract not initialized")
    try {
      const tx = await contract.registerVoter(
        name,
        nationalId,
        location,
        birthDate
      )
      const receipt = await tx.wait()
      if (receipt.status === 0) throw new Error("Transaction failed")
      return receipt.hash
    } catch (error) {
      console.error("Error registering voter:", error)
      throw error
    }
  }

  // Register candidate
  const registerCandidate = async (
    name: string,
    nationalId: string,
    location: string,
    age: number,
    party: string
  ) => {
    if (!contract) throw new Error("Contract not initialized")
    try {
      const tx = await contract.registerCandidate(
        name,
        nationalId,
        location,
        age,
        party
      )
      return await tx.wait()
    } catch (error) {
      console.error("Error registering candidate:", error)
      throw error
    }
  }

  // Cast vote
  const castVote = async (candidateNID: string, voterNID: string) => {
    if (!contract) throw new Error("Contract not initialized")
    try {
      const tx = await contract.castVote(candidateNID, voterNID)
      return await tx.wait()
    } catch (error) {
      console.error("Error casting vote:", error)
      throw error
    }
  }

  // End election
  const endElection = async () => {
    if (!contract) throw new Error("Contract not initialized")
    const tx = await contract.endElection()
    return await tx.wait()
  }

  return {
    contract,
    isLoading,
    error,
    isInitialized,
    isAdmin,
    getCandidates,
    registerVoter,
    registerCandidate,
    castVote,
    endElection,
  }
}

// Hook for election state
export function useElectionState() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isElectionEnded, setIsElectionEnded] = useState(false)

  const fetchElectionState = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const provider = getProvider()
      const contract = createContract(await provider.getSigner())
      const ended = await contract.electionEnded()
      setIsElectionEnded(ended)
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to fetch election state"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    isElectionEnded,
    fetchElectionState,
  }
}

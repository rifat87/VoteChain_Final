import { ethers } from "ethers"
import { contractABI, contractAddress } from "@/config/contract"

let contract: Contract | null = null

export async function getContract() {
  if (!contract) {
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("MetaMask found, setting up contract...")
      // Using ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contract = new ethers.Contract(contractAddress, contractABI, signer) as Contract
      console.log("Contract instance created successfully (v6)")
    } else {
      console.error("MetaMask not found. Please install MetaMask.")
      alert("MetaMask is required. Please install it and reload the page.")
      throw new Error("MetaMask not found.")
    }
  }
  return contract
}

// Type definitions for the contract
export type Contract = ethers.Contract & {
  // Election Management
  candidateCount(): Promise<bigint>
  electionEnded(): Promise<boolean>
  endElection(): Promise<ethers.ContractTransactionResponse>
  electionCommission(): Promise<string>
  
  // Candidate Management
  candidates(id: number): Promise<{
    id: bigint
    name: string
    voteCount: bigint
  }>
  getCandidate(id: number): Promise<{
    id: bigint
    name: string
    voteCount: bigint
  }>
  registerCandidate(name: string): Promise<ethers.ContractTransactionResponse>
  
  // Voting
  castVote(candidateId: number): Promise<ethers.ContractTransactionResponse>
  hasVoted(address: string): Promise<boolean>
  
  // Voter Management
  registerVoter(voter: string): Promise<ethers.ContractTransactionResponse>
  registeredVoters(address: string): Promise<boolean>
}

// Helper functions for contract interaction
export async function endElection() {
  const contract = await getContract()
  return contract.endElection()
}

export async function registerCandidate(name: string) {
  const contract = await getContract()
  return contract.registerCandidate(name)
}

export async function castVote(candidateId: number) {
  const contract = await getContract()
  return contract.castVote(candidateId)
}

export async function registerVoter(voter: string) {
  const contract = await getContract()
  return contract.registerVoter(voter)
}

// Query functions
export async function getCandidateCount() {
  const contract = await getContract()
  return contract.candidateCount()
}

export async function getCandidate(id: number) {
  const contract = await getContract()
  return contract.getCandidate(id)
}

export async function isElectionEnded() {
  const contract = await getContract()
  return contract.electionEnded()
}

export async function getElectionCommission() {
  const contract = await getContract()
  return contract.electionCommission()
}

export async function hasVoted(address: string) {
  const contract = await getContract()
  return contract.hasVoted(address)
}

export async function isRegisteredVoter(address: string) {
  const contract = await getContract()
  return contract.registeredVoters(address)
}

// Error handling wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    throw error
  }
} 
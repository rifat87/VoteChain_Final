import { ethers } from "ethers";

// Contract configuration for Anvil (replace with your deployed address)
export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const contractABI = [
  // Candidate functions
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_nationalId", "type": "string" },
      { "internalType": "string", "name": "_location", "type": "string" },
      { "internalType": "uint256", "name": "_age", "type": "uint256" },
      { "internalType": "string", "name": "_party", "type": "string" }
    ],
    "name": "registerCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "string", "name": "_candidateNID", "type": "string" } ],
    "name": "getCandidate",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "nationalId", "type": "string" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "uint256", "name": "age", "type": "uint256" },
          { "internalType": "string", "name": "party", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
        ],
        "internalType": "struct LocalVoting.Candidate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "nationalId", "type": "string" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "uint256", "name": "age", "type": "uint256" },
          { "internalType": "string", "name": "party", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
        ],
        "internalType": "struct LocalVoting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Voter functions
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_nationalId", "type": "string" },
      { "internalType": "string", "name": "_location", "type": "string" },
      { "internalType": "string", "name": "_birthDate", "type": "string" }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "string", "name": "_voterNID", "type": "string" } ],
    "name": "getVoter",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "nationalId", "type": "string" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "string", "name": "birthDate", "type": "string" }
        ],
        "internalType": "struct LocalVoting.Voter",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Voting functions
  {
    "inputs": [
      { "internalType": "string", "name": "_candidateNID", "type": "string" },
      { "internalType": "string", "name": "_voterNID", "type": "string" }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Election control
  {
    "inputs": [],
    "name": "endElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "electionCommission",
    "outputs": [ { "internalType": "address", "name": "", "type": "address" } ],
    "stateMutability": "view",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "nationalId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "party", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "age", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CandidateRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "nationalId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "birthDate", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VoterRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "voterNID", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "candidateNID", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
];

// Helper function to create contract instance
export function createContract(signer: ethers.Signer) {
  return new ethers.Contract(contractAddress, contractABI, signer);
}

// Helper function to get provider
export function getProvider() {
  return new ethers.JsonRpcProvider("http://localhost:8545");
}

// Helper function to get signer
export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

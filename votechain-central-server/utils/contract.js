// backend/helpers/contract.ts
import { JsonRpcProvider, Contract } from 'ethers'

// Replace this with your actual deployed contract address from Anvil
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const contractABI = [
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

// Create a provider connected to Anvil
const provider = new JsonRpcProvider('http://localhost:8545')

// Return the contract instance
export function getContract() {
  return new Contract(contractAddress, contractABI, provider)
}

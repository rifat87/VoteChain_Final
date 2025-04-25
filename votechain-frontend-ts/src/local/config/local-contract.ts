import { ethers } from 'ethers';

// Local contract address - this will be updated when deploying locally
// Default to the first Anvil account's address
export const localContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Local contract ABI - this should match your LocalVoting.sol contract
export const localContractABI = [
  // Admin functions
  "function isAdmin(address) view returns (bool)",
  "function startElection() external",
  "function endElection() external",
  
  // Candidate management
  "function registerCandidate(string memory name, string memory nationalId, string memory location) external",
  "function getCandidates() view returns (tuple(uint256 id, string name, string nationalId, string location, uint256 voteCount, bool isVerified)[])",
  "function getCandidate(uint256 id) view returns (tuple(uint256 id, string name, string nationalId, string location, uint256 voteCount, bool isVerified))",
  "function getVoteCount(uint256 candidateId) view returns (uint256)",
  
  // Voter management
  "function registerVoter(address voter) external",
  "function isRegisteredVoter(address) view returns (bool)",
  "function isVoted(address) view returns (bool)",
  "function castVote(uint256 candidateId) external",
  
  // Events
  "event CandidateRegistered(uint256 indexed id, string name, string nationalId, string location)",
  "event VoterRegistered(address indexed voter)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
  "event ElectionStarted()",
  "event ElectionEnded()"
];

// Helper function to create local contract instance
export function createLocalContract(signer: ethers.Signer) {
  return new ethers.Contract(localContractAddress, localContractABI, signer);
}

// Helper function to get local provider
export function getLocalProvider() {
  return new ethers.JsonRpcProvider('http://localhost:8545');
}

// Helper function to get local signer
export async function getLocalSigner() {
  const provider = getLocalProvider();
  return provider.getSigner();
} 
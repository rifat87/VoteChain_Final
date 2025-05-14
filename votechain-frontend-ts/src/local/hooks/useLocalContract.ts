import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useLocalWallet } from './useLocalWallet';

// LocalVoting Contract ABI
const contractABI = [
  "function registerCandidate(string memory _name, string memory _nationalId, string memory _location, bytes32 _faceHash) public",
  "function updateFaceHash(uint _candidateId, bytes32 _newFaceHash) public",
  "function verifyFaceHash(uint _candidateId, bytes32 _providedHash) public view returns (bool)",
  "function getCandidateFaceHash(uint _candidateId) public view returns (bytes32)",
  "function verifyCandidate(uint _candidateId) public",
  "function registerVoter(address _voter) public",
  "function castVote(uint _candidateId) public",
  "function endElection() public",
  "function getCandidate(uint _candidateId) public view returns (tuple(uint id, string name, string nationalId, string location, uint voteCount, bool isVerified))",
  "function candidateCount() public view returns (uint)",
  "function electionCommission() public view returns (address)",
  "function electionEnded() public view returns (bool)"
];

// Deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Candidate {
  id: number;
  name: string;
  nationalId: string;
  location: string;
  voteCount: number;
  isVerified: boolean;
}

interface ContractState {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isConnecting: boolean;
}

let contract: ethers.Contract | null = null;
let initializationPromise: Promise<ethers.Contract> | null = null;
let isConnecting = false;

export async function getContract() {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (isConnecting) {
    throw new Error('MetaMask connection in progress. Please wait.');
  }

  initializationPromise = (async () => {
    if (!contract) {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          isConnecting = true;
          console.log("MetaMask found, setting up contract...");
          
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length === 0) {
            // Request account access only if not already connected
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          }
          
          // Using ethers v6
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          contract = new ethers.Contract(contractAddress, contractABI, signer) as ethers.Contract;
          console.log("Contract instance created successfully (v6)");
        } catch (error) {
          console.error("Failed to initialize contract:", error);
          initializationPromise = null;
          throw error;
        } finally {
          isConnecting = false;
        }
      } else {
        console.error("MetaMask not found. Please install MetaMask.");
        alert("MetaMask is required. Please install it and reload the page.");
        throw new Error("MetaMask not found.");
      }
    }
    return contract;
  })();

  return initializationPromise;
}

export function useLocalContract() {
  const { address } = useLocalWallet();
  const [state, setState] = useState<ContractState>({
    candidates: [],
    isLoading: false,
    error: null,
    isInitialized: false,
    isConnecting: false,
  });

  // Initialize contract when the hook is first used
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initContract = async () => {
      if (!address) return;
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null, isConnecting: true }));
        await getContract();
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false, isInitialized: true, isConnecting: false }));
        }
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to initialize contract',
            isLoading: false,
            isInitialized: false,
            isConnecting: false,
          }));

          // If the error is due to a pending request, retry after a delay
          if (error instanceof Error && error.message.includes('already pending')) {
            retryTimeout = setTimeout(() => {
              if (mounted) {
                initContract();
              }
            }, 1000); // Retry after 1 second
          }
        }
      }
    };

    initContract();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [address]);

  useEffect(() => {
    if (!address || !contract || !state.isInitialized) return;

    const fetchCandidates = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const count = await contract!.candidateCount();
        const candidates: Candidate[] = [];
        
        for (let i = 1; i <= count; i++) {
          const candidate = await contract!.getCandidate(i);
          candidates.push({
            id: Number(candidate.id),
            name: candidate.name,
            nationalId: candidate.nationalId,
            location: candidate.location,
            voteCount: Number(candidate.voteCount),
            isVerified: candidate.isVerified,
          });
        }

        setState(prev => ({
          ...prev,
          candidates,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch candidates',
          isLoading: false,
        }));
      }
    };

    fetchCandidates();
  }, [address, contract, state.isInitialized]);

  const getCandidates = async () => {
    if (!contract || !state.isInitialized) {
      throw new Error('Contract not initialized');
    }
    try {
      const count = await contract.candidateCount();
      const candidates: Candidate[] = [];
      
      for (let i = 1; i <= count; i++) {
        const candidate = await contract.getCandidate(i);
        candidates.push({
          id: Number(candidate.id),
          name: candidate.name,
          nationalId: candidate.nationalId,
          location: candidate.location,
          voteCount: Number(candidate.voteCount),
          isVerified: candidate.isVerified,
        });
      }
      return candidates;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch candidates');
    }
  };

  const isAdmin = async (address: string) => {
    if (!contract || !state.isInitialized) {
      throw new Error('Contract not initialized');
    }
    try {
      const commissionAddress = await contract.electionCommission();
      return address.toLowerCase() === commissionAddress.toLowerCase();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check admin status');
    }
  };

  const registerCandidate = async (name: string, nationalId: string, location: string, faceHash: string) => {
    if (!contract || !state.isInitialized) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.registerCandidate(name, nationalId, location, faceHash);
      await tx.wait();
      const count = await contract.candidateCount();
      const candidate = await contract.getCandidate(count);
      setState(prev => ({
        ...prev,
        candidates: [...prev.candidates, {
          id: Number(candidate.id),
          name: candidate.name,
          nationalId: candidate.nationalId,
          location: candidate.location,
          voteCount: Number(candidate.voteCount),
          isVerified: candidate.isVerified,
        }],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to register candidate',
        isLoading: false,
      }));
      throw error;
    }
  };

  const registerVoter = async (voterAddress: string) => {
    if (!contract || !state.isInitialized) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.registerVoter(voterAddress);
      await tx.wait();
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to register voter',
        isLoading: false,
      }));
      throw error;
    }
  };

  const castVote = async (candidateId: number) => {
    if (!contract || !state.isInitialized) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      
      // Update the candidate's vote count
      const candidate = await contract.getCandidate(candidateId);
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => 
          c.id === candidateId 
            ? { ...c, voteCount: Number(candidate.voteCount) }
            : c
        ),
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cast vote',
        isLoading: false,
      }));
      throw error;
    }
  };

  const endElection = async () => {
    if (!contract || !state.isInitialized) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.endElection();
      await tx.wait();
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end election',
        isLoading: false,
      }));
      throw error;
    }
  };

  return {
    ...state,
    registerCandidate,
    registerVoter,
    castVote,
    endElection,
    isAdmin,
    getCandidates,
  };
} 
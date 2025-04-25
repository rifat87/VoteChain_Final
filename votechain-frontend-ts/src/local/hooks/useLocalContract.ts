import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LOCAL_CONTRACT_ADDRESS, LOCAL_CONTRACT_ABI } from '../config/contract';
import { useLocalWallet } from './useLocalWallet';

interface Candidate {
  name: string;
  voteCount: number;
}

interface ContractState {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
}

export function useLocalContract() {
  const { provider, signer, isConnected } = useLocalWallet();
  const [state, setState] = useState<ContractState>({
    candidates: [],
    isLoading: false,
    error: null,
  });

  const contract = signer
    ? new ethers.Contract(LOCAL_CONTRACT_ADDRESS, LOCAL_CONTRACT_ABI, signer)
    : null;

  useEffect(() => {
    if (!isConnected || !contract) return;

    const fetchCandidates = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const candidates = await contract.getCandidates();
        setState(prev => ({
          ...prev,
          candidates: candidates.map((c: any) => ({
            name: c.name,
            voteCount: Number(c.voteCount),
          })),
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
  }, [isConnected, contract]);

  const registerCandidate = async (name: string) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.registerCandidate(name);
      await tx.wait();
      const candidates = await contract.getCandidates();
      setState(prev => ({
        ...prev,
        candidates: candidates.map((c: any) => ({
          name: c.name,
          voteCount: Number(c.voteCount),
        })),
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
    if (!contract) throw new Error('Contract not initialized');
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
    if (!contract) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      const candidates = await contract.getCandidates();
      setState(prev => ({
        ...prev,
        candidates: candidates.map((c: any) => ({
          name: c.name,
          voteCount: Number(c.voteCount),
        })),
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

  const startElection = async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const tx = await contract.startElection();
      await tx.wait();
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start election',
        isLoading: false,
      }));
      throw error;
    }
  };

  const endElection = async () => {
    if (!contract) throw new Error('Contract not initialized');
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

  const isAdmin = async (address: string) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      return await contract.isAdmin(address);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check admin status');
    }
  };

  return {
    ...state,
    registerCandidate,
    registerVoter,
    castVote,
    startElection,
    endElection,
    isAdmin,
  };
} 
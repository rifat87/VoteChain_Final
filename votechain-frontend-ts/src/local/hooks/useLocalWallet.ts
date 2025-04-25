import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  isConnected: boolean;
  error: string | null;
}

export function useLocalWallet() {
  const [state, setState] = useState<WalletState>({
    provider: null,
    signer: null,
    address: null,
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) {
        setState(prev => ({
          ...prev,
          error: 'Please install MetaMask',
        }));
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setState(prev => ({
            ...prev,
            provider,
            signer,
            address,
            isConnected: true,
            error: null,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to check connection',
        }));
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState(prev => ({
          ...prev,
          provider: null,
          signer: null,
          address: null,
          isConnected: false,
        }));
      } else {
        checkConnection();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'Please install MetaMask',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setState(prev => ({
        ...prev,
        provider,
        signer,
        address,
        isConnected: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  const disconnect = () => {
    setState(prev => ({
      ...prev,
      provider: null,
      signer: null,
      address: null,
      isConnected: false,
    }));
  };

  return {
    ...state,
    connect,
    disconnect,
  };
} 
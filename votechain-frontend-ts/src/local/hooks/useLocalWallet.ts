import { useState, useEffect } from 'react';

interface Wallet {
  address: string | null;
  connect: () => Promise<void>;
}

export function useLocalWallet(): Wallet {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Simulate wallet connection
    const connectWallet = async () => {
      // Simulate fetching wallet address
      const fetchedAddress = '0x1234567890abcdef';
      setAddress(fetchedAddress);
    };

    connectWallet();
  }, []);

  const connect = async () => {
    // Simulate wallet connection logic
    const newAddress = '0xabcdef1234567890';
    setAddress(newAddress);
  };

  return { address, connect };
} 
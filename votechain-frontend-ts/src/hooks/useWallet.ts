import { useState, useEffect } from "react"
import { ethers } from "ethers"

interface WalletState {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAddress(accounts[0].address)
            setIsConnected(true)
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null)
        setIsConnected(false)
      } else {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const connect = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        setAddress(accounts[0])
        setIsConnected(true)
      } catch (error) {
        console.error("Error connecting wallet:", error)
        throw error
      }
    } else {
      throw new Error("MetaMask not installed")
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
  }

  return {
    address,
    isConnected,
    connect,
    disconnect,
  }
} 
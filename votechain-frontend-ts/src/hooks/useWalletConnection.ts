import { useState, useEffect } from "react"
import { ethers } from "ethers"

export function useWalletConnection() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    // Check if window.ethereum is available
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)
    }
  }, [])

  const connect = async () => {
    try {
      if (!provider) {
        throw new Error("No provider available")
      }

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", [])
      const account = accounts[0]
      setAddress(account)

      // Get the network
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))

      // Get the signer
      const signer = await provider.getSigner()
      setSigner(signer)

      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
    setSigner(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAddress(accounts[0])
        }
      })

      provider.on("chainChanged", (chainId: string) => {
        setChainId(Number(chainId))
      })

      return () => {
        provider.removeAllListeners()
      }
    }
  }, [provider])

  return {
    address,
    isConnected,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
  }
} 
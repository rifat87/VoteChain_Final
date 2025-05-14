import { createContext, useContext, useEffect, useState, useRef } from "react"
import { BrowserProvider, JsonRpcSigner } from "ethers"

interface WalletState {
  isConnected: boolean
  address: string | null
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState)
  const mountedRef = useRef(true)
  const connectionRequested = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
      return
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!mountedRef.current) return

      if (accounts.length === 0) {
        // User disconnected their wallet
        setState(initialState)
      } else {
        // Only update state if we're already connected
        if (state.isConnected) {
          const provider = new BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          setState({
            isConnected: true,
            address: accounts[0],
            provider,
            signer
          })
        }
      }
    }

    const handleChainChanged = () => {
      if (!mountedRef.current) return
      window.location.reload()
    }

    // Set up event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [state.isConnected])

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    // Prevent multiple simultaneous connection attempts
    if (connectionRequested.current) {
      return
    }

    try {
      connectionRequested.current = true
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        setState({
          isConnected: true,
          address: accounts[0],
          provider,
          signer
        })
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      throw error
    } finally {
      connectionRequested.current = false
    }
  }

  const disconnect = async () => {
    // Reset the local state
    setState(initialState)
  }

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 
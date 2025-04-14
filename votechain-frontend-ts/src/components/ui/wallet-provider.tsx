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
        await disconnect()
      } else {
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

    const handleChainChanged = () => {
      if (!mountedRef.current) return
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          handleAccountsChanged(accounts)
        }
      })
      .catch(console.error)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      setState({
        isConnected: true,
        address: accounts[0],
        provider,
        signer
      })
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      throw error
    }
  }

  const disconnect = async () => {
    try {
      // Request MetaMask to disconnect
      await window.ethereum?.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {}
          }
        ]
      })
    } catch (error) {
      console.error('Error disconnecting from MetaMask:', error)
    } finally {
      // Reset local state regardless of MetaMask response
      setState(initialState)
    }
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
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@/components/ui/wallet-provider'
import { useContract } from './useContract'

export function useRole() {
  const { address, isConnected } = useWallet()
  const { contract, isAdmin } = useContract()
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const lastCheckedAddress = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true
    const currentAddress = address?.toLowerCase()

    async function checkRole() {
      if (!isConnected || !currentAddress || !contract) {
        if (mounted) {
          setIsUserAdmin(false)
          setIsLoading(false)
        }
        return
      }

      // Skip if we've already checked this address
      if (lastCheckedAddress.current === currentAddress) {
        if (mounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const adminStatus = await isAdmin(currentAddress)
        if (mounted) {
          setIsUserAdmin(adminStatus)
          lastCheckedAddress.current = currentAddress
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        if (mounted) {
          setIsUserAdmin(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkRole()

    return () => {
      mounted = false
    }
  }, [isConnected, address, contract, isAdmin])

  return {
    isAdmin: isUserAdmin,
    isLoading
  }
} 
import { useLocalContract } from '@/local/hooks/useLocalContract'
import { useLocalWallet } from '@/local/hooks/useLocalWallet'
import { useEffect, useState } from 'react'

export function useRole() {
  const { isAdmin } = useLocalContract()
  const { address } = useLocalWallet()
  const [role, setRole] = useState<'admin' | 'voter' | 'public' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkRole = async () => {
      if (!address) {
        setRole('public')
        setIsLoading(false)
        return
      }

      try {
        const admin = await isAdmin(address)
        setRole(admin ? 'admin' : 'voter')
      } catch (error) {
        console.error('Error checking role:', error)
        setRole('public')
      } finally {
        setIsLoading(false)
      }
    }

    checkRole()
  }, [address, isAdmin])

  return { role, isLoading }
} 
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalContract } from '@/local/hooks/useLocalContract'
import { useLocalWallet } from '@/local/hooks/useLocalWallet'

export function useRoleRedirect() {
  const navigate = useNavigate()
  const { isAdmin, isInitialized, isLoading } = useLocalContract()
  const { address } = useLocalWallet()

  useEffect(() => {
    const checkRole = async () => {
      // Don't redirect if we're still initializing
      if (isLoading || !isInitialized) {
        return;
      }

      if (!address) {
        navigate('/')
        return
      }

      try {
        const admin = await isAdmin(address)
        if (admin) {
          navigate('/admin')
        } else {
          navigate('/voter')
        }
      } catch (error) {
        console.error('Error checking role:', error)
        navigate('/')
      }
    }

    checkRole()
  }, [address, isAdmin, navigate, isInitialized, isLoading])
} 
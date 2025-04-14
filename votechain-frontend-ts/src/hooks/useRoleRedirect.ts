import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@/components/ui/wallet-provider'
import { useContract } from '@/hooks/useContract'

export function useRoleRedirect() {
  const navigate = useNavigate()
  const { isConnected, address } = useWallet()
  const { isAdmin } = useContract()
  const isChecking = useRef(false)
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isConnected || !address || isChecking.current) return

      try {
        isChecking.current = true
        const isUserAdmin = await isAdmin(address)
        const currentPath = window.location.pathname

        // Skip redirection for registration route
        if (currentPath === '/register') {
          isChecking.current = false
          return
        }

        // Only redirect if we haven't already redirected to this path
        if (lastPath.current !== currentPath) {
          if (isUserAdmin) {
            if (!currentPath.startsWith('/admin')) {
              navigate('/admin')
            }
          } else {
            if (!currentPath.startsWith('/voter')) {
              navigate('/voter')
            }
          }
          lastPath.current = currentPath
        }
      } catch (error) {
        console.error('Error checking role:', error)
        // If there's an error, redirect to voter dashboard
        if (!window.location.pathname.startsWith('/voter')) {
          navigate('/voter')
        }
      } finally {
        isChecking.current = false
      }
    }

    checkRoleAndRedirect()
  }, [isConnected, address, isAdmin, navigate])
} 
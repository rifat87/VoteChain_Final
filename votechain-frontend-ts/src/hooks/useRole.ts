import { useContract } from '@/hooks/useContract'
import { useWallet } from '@/components/ui/wallet-provider'

export function useRole() {
  const { isAdmin } = useContract()
  const { address } = useWallet()

  return {
    isAdmin,
    address
  }
} 
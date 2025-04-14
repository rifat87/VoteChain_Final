import { Navigate, useLocation } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAdmin, isLoading, isConnected } = useRole()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isConnected) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/vote" state={{ from: location }} replace />
  }

  return <>{children}</>
} 
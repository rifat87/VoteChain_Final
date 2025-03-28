import { useEffect } from 'react'
import { useElectionState } from '@/hooks/useContract'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ElectionStatus() {
  const { isLoading, error, isElectionEnded, candidateCount, fetchElectionState } = useElectionState()

  useEffect(() => {
    fetchElectionState()
  }, [fetchElectionState])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Election Status</span>
          <Badge variant={isElectionEnded ? "destructive" : "default"}>
            {isElectionEnded ? 'Ended' : 'Active'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Total Candidates: {candidateCount}
          </p>
          <p className="text-sm text-muted-foreground">
            Status: {isElectionEnded ? 'Election has ended' : 'Election is in progress'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 
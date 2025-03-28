import { useEffect } from 'react'
import { useCandidates, useVoting } from '@/hooks/useContract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CandidateList() {
  const { candidates, isLoading, error, fetchCandidates } = useCandidates()
  const { castVote, isLoading: isVoting } = useVoting()

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const handleVote = async (candidateId: number) => {
    try {
      await castVote(candidateId)
      await fetchCandidates() // Refresh the list after voting
    } catch (error) {
      console.error('Failed to cast vote:', error)
    }
  }

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{candidate.name}</span>
              <span className="text-sm text-muted-foreground">
                Votes: {candidate.voteCount}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleVote(candidate.id)}
              disabled={isVoting}
              className="w-full"
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
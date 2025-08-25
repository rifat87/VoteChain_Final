import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: number
  name: string
  nationalId: string
  location: string
  voteCount: number
  isVerified: boolean
}

interface CandidateListProps {
  candidates: Candidate[]
  onVote?: (candidateId: number) => void
  isLoading: boolean
}

export function CandidateList({ candidates, onVote, isLoading }: CandidateListProps) {
  if (isLoading) {
    return <div>Loading candidates...</div>
  }

  // Calculate total votes for percentage
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0)

  return (
    <div className="grid gap-4">
      {candidates.map((candidate) => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0
        
        return (
          <Card key={candidate.id}>
            <CardHeader>
              <CardTitle>{candidate.name}</CardTitle>
              <CardDescription>
                Location: {candidate.location}
                {!candidate.isVerified && (
                  <span className="ml-2 text-green-500">(Verified)</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Votes: {candidate.voteCount}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>
                {onVote && candidate.isVerified && (
                  <Button
                    onClick={() => onVote(candidate.id)}
                    className="w-full"
                  >
                    Vote
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 
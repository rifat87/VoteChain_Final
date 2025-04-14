import { useState, useEffect } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/hooks/useContract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
  percentage: number
}

export function VoterDashboard() {
  const { address, isConnected } = useWallet()
  const { getContract } = useContract()
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    fetchCandidates()
    checkVotingStatus()
  }, [address])

  async function fetchCandidates() {
    try {
      const contract = await getContract()
      const candidates = await contract.getCandidates()
      const totalVotes = candidates.reduce((sum: number, c: Candidate) => sum + c.votes, 0)
      
      const formattedCandidates = candidates.map((c: Candidate) => ({
        ...c,
        percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
      }))
      
      setCandidates(formattedCandidates)
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch candidates',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function checkVotingStatus() {
    if (!address) return

    try {
      const contract = await getContract()
      const voted = await contract.hasVoted(address)
      setHasVoted(voted)
    } catch (error) {
      console.error('Error checking voting status:', error)
    }
  }

  async function handleVote(candidateId: number) {
    if (!isConnected || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      })
      return
    }

    try {
      const contract = await getContract()
      const tx = await contract.castVote(candidateId)
      await tx.wait()
      
      toast({
        title: 'Success',
        description: 'Vote cast successfully'
      })
      
      setHasVoted(true)
      fetchCandidates()
    } catch (error) {
      console.error('Error casting vote:', error)
      toast({
        title: 'Error',
        description: 'Failed to cast vote',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voter Dashboard</h1>
          <p className="text-muted-foreground">
            {hasVoted ? 'You have already cast your vote' : 'Cast your vote for your preferred candidate'}
          </p>
        </div>

        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.party}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Votes: {candidate.votes}</span>
                      <span>{candidate.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={candidate.percentage} />
                  </div>
                  {!hasVoted && (
                    <Button
                      onClick={() => handleVote(candidate.id)}
                      className="w-full"
                    >
                      Vote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 
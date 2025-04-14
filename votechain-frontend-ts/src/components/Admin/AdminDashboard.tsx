import { useState, useEffect } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useContract } from '@/hooks/useContract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
  percentage: number
}

export function AdminDashboard() {
  const { address, isConnected } = useWallet()
  const { getContract } = useContract()
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' })

  useEffect(() => {
    fetchCandidates()
  }, [])

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

  async function handleAddCandidate() {
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
      const tx = await contract.registerCandidate(newCandidate.name, newCandidate.party)
      await tx.wait()
      
      toast({
        title: 'Success',
        description: 'Candidate registered successfully'
      })
      
      setNewCandidate({ name: '', party: '' })
      fetchCandidates()
    } catch (error) {
      console.error('Error registering candidate:', error)
      toast({
        title: 'Error',
        description: 'Failed to register candidate',
        variant: 'destructive'
      })
    }
  }

  async function handleEndElection() {
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
      const tx = await contract.endElection()
      await tx.wait()
      
      toast({
        title: 'Success',
        description: 'Election ended successfully'
      })
    } catch (error) {
      console.error('Error ending election:', error)
      toast({
        title: 'Error',
        description: 'Failed to end election',
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleEndElection} variant="destructive">
            End Election
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Candidate</CardTitle>
            <CardDescription>Register a new candidate for the election</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Candidate Name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
              />
              <Input
                placeholder="Party"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
              />
              <Button onClick={handleAddCandidate}>Add Candidate</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.party}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Votes: {candidate.votes}</span>
                    <span>{candidate.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={candidate.percentage} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 
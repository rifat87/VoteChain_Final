import { useState, useEffect } from "react"
import { useWallet } from "@/components/ui/wallet-provider"
import { useContract } from "@/hooks/useContract"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
  percentage: number
}

export function CandidateList() {
  const { isConnected, address } = useWallet()
  const { getCandidates } = useContract()
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCandidates() {
      try {
        console.log('Fetching candidates...')
        console.log('Wallet connected:', isConnected)
        console.log('Wallet address:', address)
        
        const candidatesData = await getCandidates()
        console.log('Raw candidates data:', candidatesData)
        
        // Calculate total votes
        const totalVotes = candidatesData.reduce((sum, candidate) => sum + candidate.votes, 0)
        console.log('Total votes:', totalVotes)
        
        // Format candidates with percentages
        const formattedCandidates = candidatesData.map(candidate => ({
          ...candidate,
          percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
        }))
        console.log('Formatted candidates:', formattedCandidates)
        
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

    if (isConnected) {
      fetchCandidates()
    } else {
      console.log('Wallet not connected, skipping candidate fetch')
      setIsLoading(false)
    }
  }, [isConnected, getCandidates, toast, address])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please connect your wallet to view candidates</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No candidates found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardHeader>
            <CardTitle>{candidate.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{candidate.party}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Votes</span>
                <span>{candidate.votes}</span>
              </div>
              <Progress value={candidate.percentage} />
              <div className="flex justify-between text-sm">
                <span>Percentage</span>
                <span>{candidate.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
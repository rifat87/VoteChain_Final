import { useEffect, useState } from "react"
import { useLocalContract } from "@/local/hooks/useLocalContract"
import { useLocalWallet } from "@/local/hooks/useLocalWallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Candidate {
  id: number
  name: string
  nationalId: string
  location: string
  voteCount: number
  isVerified: boolean
}

export default function Dashboard() {
  const { address } = useLocalWallet()
  const { getCandidates, castVote, isLoading, error, isInitialized } = useLocalContract()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!isInitialized) return
      
      try {
        setLocalLoading(true)
        setLocalError(null)
        const fetchedCandidates = await getCandidates()
        setCandidates(fetchedCandidates)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to fetch candidates')
        console.error('Error fetching candidates:', err)
      } finally {
        setLocalLoading(false)
      }
    }

    fetchCandidates()
  }, [getCandidates, isInitialized])

  const handleVote = async (candidateId: number) => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setLocalLoading(true)
      setLocalError(null)
      await castVote(candidateId)
      // Refresh candidates after voting
      const updatedCandidates = await getCandidates()
      setCandidates(updatedCandidates)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to cast vote')
      console.error('Error casting vote:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Initializing contract...</p>
        </div>
      </div>
    )
  }

  if (error || localError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error || localError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Election Dashboard</h1>
      
      {(isLoading || localLoading) && (
        <div className="flex justify-center mb-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{candidate.name}</span>
                {candidate.isVerified && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>National ID:</strong> {candidate.nationalId}</p>
                <p><strong>Location:</strong> {candidate.location}</p>
                <p><strong>Votes:</strong> {candidate.voteCount}</p>
                <Button
                  onClick={() => handleVote(candidate.id)}
                  disabled={isLoading || localLoading || !candidate.isVerified}
                  className="w-full mt-4"
                >
                  {isLoading || localLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Vote'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && !isLoading && !localLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No candidates registered yet.</p>
        </div>
      )}
    </div>
  )
} 
import { useEffect, useState } from "react"
import { useLocalContract } from "@/local/hooks/useLocalContract"
import { useLocalWallet } from "@/local/hooks/useLocalWallet"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Vote() {
  const router = useRouter()
  const { getCandidates, castVote } = useLocalContract()
  const { address } = useLocalWallet()
  const [candidates, setCandidates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await getCandidates()
        setCandidates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch candidates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidates()
  }, [getCandidates])

  const handleVote = async (candidateId: number) => {
    try {
      await castVote(candidateId)
      router.push('/voter/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your address: {address}</p>
          <CandidateList 
            candidates={candidates} 
            onVote={handleVote}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
} 
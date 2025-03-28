import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { getContract } from "@/utils/contract"

interface Candidate {
  id: string
  name: string
  voteCount: string
}

export function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [candidateCount, setCandidateCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const contract = await getContract()
      const count = await contract.candidateCount()
      setCandidateCount(Number(count))

      const candidateArray: Candidate[] = []
      for (let i = 1; i <= count; i++) {
        const candidateData = await contract.getCandidate(i)
        candidateArray.push({
          id: candidateData.id.toString(),
          name: candidateData.name,
          voteCount: candidateData.voteCount.toString(),
        })
      }
      setCandidates(candidateArray)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      setError("Failed to fetch candidates. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Candidate List</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCandidates}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isLoading ? "Refreshing..." : "Refresh List"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center py-4">Loading candidates...</div>
        )}
        
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {!isLoading && !error && candidates.length > 0 ? (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <span className="font-medium">{candidate.name}</span>
                  <span className="text-muted-foreground ml-2">
                    (ID: {candidate.id})
                  </span>
                </div>
                <Badge variant="secondary">
                  {candidate.voteCount} votes
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && !error && (
            <p className="text-center text-muted-foreground">
              No candidates registered yet.
            </p>
          )
        )}
        
        <p className="mt-4 text-sm text-muted-foreground">
          Total Candidates: {candidateCount}
        </p>
      </CardContent>
    </Card>
  )
} 
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: number
  name: string
  nationalId: string
  location: string
  voteCount: number
  isVerified: boolean
}

export function PublicDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [electionEnded, setElectionEnded] = useState(false)
  const [candidateCount, setCandidateCount] = useState(0)

  const fetchPublicElectionData = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:5000/api/elections/public/election-data')
      if (!res.ok) throw new Error('API request failed')

      const data = await res.json()
      setCandidates(data.candidates)
      setElectionEnded(data.ended)
      setCandidateCount(data.count)
    } catch (err) {
      console.error('Failed to load public election data', err)
      setError('Could not fetch election data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicElectionData()
  }, [])

  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0)
  const status = electionEnded ? "Ended" : "Ongoing"

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading election data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive mt-4">{error}</p>
            <Button variant="outline" onClick={fetchPublicElectionData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">2025 National Election</span>
              <Badge variant={status === "Ongoing" ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">Total Candidates:</span> {candidateCount}<br />
              <span className="font-medium">Total Votes:</span> {totalVotes}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Candidates</h3>
            <div className="space-y-4">
              {candidates.map(candidate => (
                <div
                  key={candidate.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-background/80 gap-2"
                >
                  <div>
                    <div className="font-medium text-base">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground">National ID: {candidate.nationalId}</div>
                    <div className="text-xs text-muted-foreground">Location: {candidate.location}</div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 min-w-[140px]">
                    <span className="text-sm font-semibold">Votes: {candidate.voteCount}</span>
                    <Badge variant="default">

                      {candidate.isVerified ? "Registered" : "Registerd"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

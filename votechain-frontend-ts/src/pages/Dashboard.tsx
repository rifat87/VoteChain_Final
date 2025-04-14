import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from '@/components/ui/progress'
import { useContract } from "@/hooks/useContract"
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar"

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
  percentage: number
}

export default function Dashboard() {
  const { getCandidates } = useContract()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getCandidates()
      const totalVotes = data.reduce((sum, candidate) => sum + candidate.votes, 0)
      
      const formattedCandidates = data.map(candidate => ({
        ...candidate,
        percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
      }))
      
      setCandidates(formattedCandidates)
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getCandidates])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0)

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Election Overview</h1>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Votes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalVotes}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{candidates.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voter Turnout</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {candidates.map((candidate) => (
                      <Card key={candidate.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.party}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">{candidate.votes} votes</p>
                              <p className="text-sm text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                          <Progress
                            value={candidate.percentage}
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
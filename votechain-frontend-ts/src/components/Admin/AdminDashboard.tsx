import { useEffect, useState } from "react"
import { useLocalContract } from "@/local/hooks/useLocalContract"
import { useLocalWallet } from "@/local/hooks/useLocalWallet"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoterRegistration } from "./VoterRegistration"

export function AdminDashboard() {
  const navigate = useNavigate()
  const { getCandidates, endElection } = useLocalContract()
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

  const handleEndElection = async () => {
    try {
      await endElection()
      navigate('/admin/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end election')
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
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="voters">Voter Registration</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Your address: {address}</p>
              <CandidateList 
                candidates={candidates} 
                isLoading={isLoading}
              />
              <Button 
                onClick={handleEndElection}
                className="mt-4"
                variant="destructive"
              >
                End Election
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="voters">
          <VoterRegistration />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
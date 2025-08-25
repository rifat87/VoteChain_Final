import { useEffect, useState } from "react"
import { Candidate } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VoterDashboard() {
  const { isWalletChecked, isConnected } = useWallet()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:5000/api/elections/public/election-data")
      const data = await res.json()
      setCandidates(data.candidates)
    } catch (err) {
      console.error("Failed to fetch candidates in VoterDashboard:", err)
      setError("Could not fetch candidate data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isWalletChecked && isConnected) {
      fetchCandidates()
    }
  }, [isWalletChecked, isConnected])

  if (!isWalletChecked || !isConnected) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Checking wallet...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading candidates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive mt-2">{error}</p>
        <Button variant="outline" onClick={fetchCandidates} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Voter Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateList candidates={candidates} isLoading={false} />
        </CardContent>
      </Card>
    </div>
  )
}
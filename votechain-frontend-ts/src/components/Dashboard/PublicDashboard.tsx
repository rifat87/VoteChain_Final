import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getContract } from "@/utils/contract"
import { CandidateList } from "./CandidateList"

export function PublicDashboard() {
  const [isElectionActive, setIsElectionActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkElectionStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const contract = await getContract()
        const status = await contract.isElectionActive()
        setIsElectionActive(status)
      } catch (error) {
        console.error("Error checking election status:", error)
        setError("Failed to check election status. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    checkElectionStatus()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Checking election status...</div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge variant={isElectionActive ? "default" : "secondary"}>
                {isElectionActive ? "Active" : "Ended"}
              </Badge>
              <span className="text-muted-foreground">
                {isElectionActive
                  ? "The election is currently in progress"
                  : "The election has ended"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <CandidateList />
    </div>
  )
} 
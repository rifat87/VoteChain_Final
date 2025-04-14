import { useState, useEffect } from "react"
import { useWallet } from "@/components/ui/wallet-provider"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Badge } from "@/components/ui/badge"
import { getContract } from "@/utils/contract"

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
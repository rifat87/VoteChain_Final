import { useState, useEffect } from "react"
import { useWallet } from "@/components/ui/wallet-provider"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useContract, Candidate } from "@/hooks/useContract"

export function AdminDashboard() {
  const navigate = useNavigate()
  const { address } = useWallet()
  const { toast } = useToast()
  const { getCandidates, isLoading: contractLoading, error: contractError, isInitialized } = useContract()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // DEMO: Face verification state - will be deleted later
  const [isVerifying, setIsVerifying] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCandidates()
      setCandidates(data)
    } catch (err) {
      console.error("Error fetching candidates:", err)
      setError("Failed to fetch candidates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isInitialized) {
      fetchCandidates()
    }
  }, [isInitialized])

  const handleEndElection = async () => {
    // Demo: just navigate, no contract call
    navigate('/admin/results')
  }

  const handleRegisterCandidate = () => {
    navigate('/admin/register-candidate')
  }

  const handleRegisterVoter = () => {
    navigate('/admin/register-voter')
  }

  // DEMO: Face verification function - will be deleted later
  const handleVerifyFace = async () => {
    setIsVerifying(true)
    
    toast({
      title: "Face Verification",
      description: "Starting face verification process...",
    })

    try {
      const response = await fetch('http://localhost:5000/api/votes/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "✅ Face Verification Successful!",
          description: data.message || "Face recognition completed successfully",
        })
      } else {
        toast({
          title: "❌ Face Verification Failed",
          description: data.message || "Face not recognized",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Face verification error:', error)
      toast({
        title: "❌ Verification Error",
        description: "Failed to connect to face recognition system",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFormatFingerprint = async () => {
    setIsFormatting(true)
  
    toast({
      title: "Formatting Fingerprint Database",
      description: "Sending request to reset fingerprint sensor...",
    })
  
    try {
      const response = await fetch("http://localhost:5000/api/biometric/fingerprint/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
  
      const data = await response.json()
  
      if (response.ok && data.success) {
        toast({
          title: "✅ Database Cleared",
          description: "All fingerprint records have been deleted.",
        })
      } else {
        throw new Error(data.message || "Unknown error while formatting")
      }
    } catch (error) {
      console.error("Format error:", error)
      toast({
        title: "❌ Format Failed",
        description: error instanceof Error ? error.message : "Failed to communicate with sensor",
        variant: "destructive",
      })
    } finally {
      setIsFormatting(false)
    }
  }

  if (loading || contractLoading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span>Loading candidates...</span>
    </div>
  )

  if (error || contractError) return (
    <div className="flex items-center justify-center py-8 space-x-2 text-destructive">
      <AlertCircle className="h-6 w-6" />
      <span>{error || contractError?.message}</span>
      <Button onClick={fetchCandidates} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" /> Retry
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Admin Dashboard</CardTitle>
          <Button onClick={fetchCandidates} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Candidates</h2>
              <div className="flex gap-2">
                <Button onClick={handleRegisterVoter} variant="default">
                  Register Voter
                </Button>
                <Button onClick={handleRegisterCandidate} variant="default">
                  Register Candidate
                </Button>
                {/* <Button 
                  onClick={handleFormatFingerprint} 
                  variant="destructive" 
                  disabled={isFormatting}
                >
                  {isFormatting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Formatting...
                    </>
                  ) : (
                    "Format Fingerprints"
                  )}
                </Button> */}
              </div>
            </div>

            <CandidateList candidates={candidates} isLoading={false} />

            {/* <Button className="mt-4" onClick={handleEndElection}>
              End Election
            </Button> */}

            {/* Demo button - will be deleted later */}
            {/* <Button 
              className="mt-2" 
              variant="outline"
              onClick={handleVerifyFace}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Face'
              )}
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

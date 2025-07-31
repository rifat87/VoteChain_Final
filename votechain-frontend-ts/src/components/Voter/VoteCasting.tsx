import { useState, useEffect } from "react"
import { useContract, Candidate } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Vote, CheckCircle2, User, MapPin, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { VerificationModal } from "@/components/Biometric/VerificationModal"

export function VoteCasting() {
  const { isWalletChecked, isConnected, address } = useWallet()
  const { isInitialized, castVote, getCandidates, isLoading: contractLoading, error: contractError } = useContract()
  const { toast } = useToast()
  
  // Candidate data state
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Voting state
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null)

  // Biometric verification modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingCandidate, setPendingCandidate] = useState<number | null>(null)

  // Fetch candidates from blockchain
  useEffect(() => {
    let mounted = true

    async function fetchCandidates() {
      if (!mounted || !isInitialized) return
      
      setLoading(true)
      setError(null)
      try {
        console.log('Starting to fetch candidates for voting...')
        console.log('Contract loading state:', contractLoading)
        console.log('Contract error state:', contractError)
        const data = await getCandidates()
        if (!mounted) return
        console.log('Raw candidate data received:', data)
        setCandidates(data)
      } catch (err) {
        if (!mounted) return
        console.error('Error in fetchCandidates:', err)
        setError("Failed to fetch candidates")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (isInitialized) {
      fetchCandidates()
    }

    return () => {
      mounted = false
    }
  }, [isInitialized, getCandidates, contractLoading, contractError])

  // Calculate total votes for percentage
  const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0)

  const handleVote = (candidateId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      })
      return
    }

    setPendingCandidate(candidateId)
    setIsModalOpen(true)
  }

  const handleVerified = async (voterNid: string) => {
    if (!pendingCandidate) return

    const candidateId = pendingCandidate

    try {
      setIsVoting(true)
      setSelectedCandidate(candidateId)

      await castVote(candidateId, voterNid)

      setHasVoted(true)
      setVotedCandidateId(candidateId)

      toast({
        title: "Vote Cast Successfully!",
        description: `Your vote for ${candidates.find(c => c.id === candidateId)?.name} has been recorded.`,
      })
    } catch (error) {
      console.error("Error casting vote:", error)
      toast({
        title: "Vote Failed",
        description: "There was an error casting your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
      setSelectedCandidate(null)
      setPendingCandidate(null)
      setIsModalOpen(false)
    }
  }

  const handleRetry = () => {
    if (isInitialized) {
      setError(null)
      setLoading(true)
      // Trigger useEffect by updating a dependency
      getCandidates().then(data => {
        setCandidates(data)
        setLoading(false)
      }).catch(err => {
        setError("Failed to fetch candidates")
        setLoading(false)
      })
    }
  }

  // Loading state
  if (!isWalletChecked || !isConnected || !isInitialized || loading || contractLoading) {
    return (
      <>
      <VerificationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handleVerified}
      />
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-6 w-6" />
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Loading candidates...</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  // Error state
  if (error || contractError) {
    return (
      <>
      <VerificationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handleVerified}
      />
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-6 w-6" />
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <p className="text-destructive">{error || contractError?.message}</p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  // Success state after voting
  if (hasVoted) {
    const votedCandidate = candidates.find(c => c.id === votedCandidateId)
    return (
      <>
      <VerificationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handleVerified}
      />
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="h-8 w-8" />
              <CardTitle className="text-2xl">Vote Recorded!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">
              Thank you for participating in the election!
            </p>
            <p className="text-muted-foreground">
              Your vote for <strong>{votedCandidate?.name}</strong> has been successfully recorded on the blockchain.
            </p>
            <Badge variant="secondary" className="text-sm">
              Transaction Hash: 0x1234...abcd (Demo)
            </Badge>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  // Main voting interface
  return (
    <>
    <VerificationModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onVerified={handleVerified}
    />
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-6 w-6" />
            Cast Your Vote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Select a candidate below to cast your vote. Your vote will be recorded on the blockchain after biometric verification.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <User className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No candidates found for this election.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {candidates.map((candidate) => {
            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0
            const isCurrentlyVoting = isVoting && selectedCandidate === candidate.id
            
            return (
              <Card key={candidate.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {candidate.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        National ID: {candidate.nationalId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{candidate.voteCount || 0}</div>
                      <div className="text-sm text-muted-foreground">votes</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Support</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  <Button
                    onClick={() => handleVote(candidate.id)}
                    disabled={isVoting}
                    className="w-full"
                    size="lg"
                  >
                    {isCurrentlyVoting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Vote...
                      </>
                    ) : (
                      <>
                        <Vote className="mr-2 h-4 w-4" />
                        Vote for {candidate.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Connected Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <span>Total Votes Cast: {totalVotes}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
} 
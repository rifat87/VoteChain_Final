import { useState } from "react"
import { useWallet } from "@/components/ui/wallet-provider"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

// Demo candidate data
const demoCandidates = [
  {
    id: 1,
    name: "Alice Johnson",
    nationalId: "1234567890",
    location: "New York",
    voteCount: 42,
    isVerified: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    nationalId: "9876543210",
    location: "California",
    voteCount: 37,
    isVerified: false,
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const { address } = useWallet()
  const [candidates] = useState(demoCandidates)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

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

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
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
              </div>
            </div>
              <CandidateList candidates={candidates} isLoading={false} />
              <Button className="mt-4" onClick={handleEndElection}>
                End Election
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
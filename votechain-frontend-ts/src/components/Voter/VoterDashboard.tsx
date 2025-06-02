import { useEffect, useState } from "react"
import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { CandidateList } from "@/components/Dashboard/CandidateList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import type { Candidate } from "@/hooks/useContract"

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

export function VoterDashboard() {
  const { isWalletChecked, isConnected } = useWallet()
  const { isInitialized } = useContract()

  if (!isWalletChecked || !isConnected || !isInitialized) {
    return <div className="flex h-screen items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>
  }

  // Only show dashboard if wallet and contract are ready
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Voter Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateList candidates={demoCandidates} isLoading={false} />
        </CardContent>
      </Card>
    </div>
  )
} 
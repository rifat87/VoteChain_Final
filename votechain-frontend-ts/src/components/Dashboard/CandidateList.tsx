import { useState, useEffect } from "react"
import { useWallet } from "@/components/ui/wallet-provider"
import { useContract } from "@/hooks/useContract"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
  percentage: number
}

interface CandidateListProps {
  candidates: Candidate[]
  onVote?: (candidateId: number) => void
  isLoading: boolean
}

export function CandidateList({ candidates, onVote, isLoading }: CandidateListProps) {
  if (isLoading) {
    return <div>Loading candidates...</div>
  }

  return (
    <div className="grid gap-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardHeader>
            <CardTitle>{candidate.name}</CardTitle>
            <CardDescription>{candidate.party}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Votes: {candidate.votes}</span>
                  <span>{candidate.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={candidate.percentage} />
              </div>
              {onVote && (
                <Button
                  onClick={() => onVote(candidate.id)}
                  className="w-full"
                >
                  Vote
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
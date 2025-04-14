import { useState, useEffect } from "react"
import { useWallet } from "@/components/WalletProvider"
import { useContract } from "@/hooks/useContract"
import { mockCandidates, mockActivities, mockElectionStats } from "@/data/mockData"
import type { Candidate, Activity, ElectionStats } from "@/data/mockData"

export function useElectionData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ElectionStats | null>(null)

  const { address } = useWallet()
  const { getCandidate, getElectionStatus } = useContract()

  useEffect(() => {
    async function fetchData() {
      try {
        // For now, we'll use mock data
        // In a real app, we would fetch this from the smart contract
        setCandidates(mockCandidates)
        setActivities(mockActivities)
        setStats(mockElectionStats)

        // If we have a connected wallet, we can fetch some real data
        if (address) {
          const status = await getElectionStatus()
          console.log("Election status:", status)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address, getElectionStatus])

  return {
    isLoading,
    error,
    candidates,
    activities,
    stats,
  }
} 
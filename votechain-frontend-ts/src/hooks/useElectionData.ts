import { useState, useEffect } from "react"
import { mockCandidates, mockActivities, mockElectionStats } from "@/data/mockData"
import type { Candidate, Activity, ElectionStats } from "@/data/mockData"

export function useElectionData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [stats, setStats] = useState<ElectionStats | null>(mockElectionStats)

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  return {
    isLoading,
    error,
    candidates,
    activities,
    stats,
  }
} 
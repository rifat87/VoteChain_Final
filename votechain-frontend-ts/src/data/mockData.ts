export interface Candidate {
  id: string
  name: string
  party: string
  votes: number
  percentage: number
}

export interface Activity {
  id: string
  type: "voter_registration" | "vote_cast" | "candidate_added"
  description: string
  timestamp: string
  count: number
}

export interface ElectionStats {
  totalCandidates: number
  registeredVoters: number
  votesCast: number
  status: "active" | "ended" | "upcoming"
}

export const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "John Doe",
    party: "Party A",
    votes: 450,
    percentage: 45,
  },
  {
    id: "2",
    name: "Jane Smith",
    party: "Party B",
    votes: 350,
    percentage: 35,
  },
  {
    id: "3",
    name: "Mike Johnson",
    party: "Party C",
    votes: 200,
    percentage: 20,
  },
]

export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "voter_registration",
    description: "New Voter Registration",
    timestamp: "2 minutes ago",
    count: 1,
  },
  {
    id: "2",
    type: "vote_cast",
    description: "Vote Cast",
    timestamp: "5 minutes ago",
    count: 1,
  },
  {
    id: "3",
    type: "candidate_added",
    description: "Candidate Added",
    timestamp: "1 hour ago",
    count: 1,
  },
]

export const mockElectionStats: ElectionStats = {
  totalCandidates: 12,
  registeredVoters: 1234,
  votesCast: 789,
  status: "active",
} 
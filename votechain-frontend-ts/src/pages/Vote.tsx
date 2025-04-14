import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

export default function Vote() {
  const { address, isConnected } = useWallet();
  const { getCandidates, castVote } = useContract();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchCandidates = async () => {
    try {
      const contractCandidates = await getCandidates();
      const totalVotes = contractCandidates.reduce((acc: number, candidate: any) => acc + Number(candidate.votes), 0);
      
      const formattedCandidates = contractCandidates.map((candidate: any, index: number) => ({
        id: index + 1,
        name: candidate.name,
        party: candidate.party,
        votes: Number(candidate.votes),
        percentage: totalVotes > 0 ? (Number(candidate.votes) / totalVotes) * 100 : 0,
      }));

      setCandidates(formattedCandidates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [toast]);

  const handleVote = async (candidateId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      await castVote(candidateId);
      toast({
        title: "Success",
        description: "Your vote has been recorded",
      });
      // Refresh candidates after voting
      await fetchCandidates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cast Your Vote</h1>
        <p className="text-muted-foreground">
          Select a candidate and click the vote button to cast your vote.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>{candidate.name}</CardTitle>
              <CardDescription>{candidate.party}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Votes</span>
                    <span>{candidate.votes}</span>
                  </div>
                  <Progress value={candidate.percentage} />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleVote(candidate.id)}
                  disabled={voting}
                >
                  {voting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Voting...
                    </>
                  ) : (
                    "Vote"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
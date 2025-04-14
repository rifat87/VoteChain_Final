import { useState, useEffect } from "react";
import { useWallet } from "@/components/ui/wallet-provider";
import { useContract } from "@/hooks/useContract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: number;
  name: string;
  votes: number;
  percentage: number;
}

export function VoterDashboard() {
  const { isConnected, address } = useWallet();
  const { getContract, castVote, getCandidates } = useContract();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    async function fetchCandidates() {
      try {
        const candidatesData = await getCandidates();
        console.log('Fetched candidates:', candidatesData);
        
        // Calculate total votes
        const totalVotes = candidatesData.reduce((sum, candidate) => sum + candidate.votes, 0);
        console.log('Total votes:', totalVotes);
        
        // Format candidates with percentages
        const formattedCandidates = candidatesData.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          votes: candidate.votes,
          percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
        }));
        
        console.log('Formatted candidates:', formattedCandidates);
        setCandidates(formattedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch candidates',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCandidates();
  }, [isConnected, getCandidates, toast, navigate]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsVoting(true);
      await castVote(selectedCandidate);
      
      toast({
        title: "Success",
        description: "Your vote has been cast successfully"
      });
      
      setHasVoted(true);
      setSelectedCandidate(null);
      
      // Refresh candidates data
      const candidatesData = await getCandidates();
      const totalVotes = candidatesData.reduce((sum, candidate) => sum + candidate.votes, 0);
      const formattedCandidates = candidatesData.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        votes: candidate.votes,
        percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Voter Dashboard</h1>
        <div className="mb-8">
          <p className="text-muted-foreground">
            {hasVoted ? "You have already cast your vote" : "Select a candidate to cast your vote"}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <Card
                key={candidate.id}
                className={cn(
                  "transition-all duration-200",
                  selectedCandidate === candidate.id && "ring-2 ring-primary",
                  hasVoted && "opacity-75"
                )}
                onClick={() => !hasVoted && setSelectedCandidate(candidate.id)}
              >
                <CardHeader>
                  <CardTitle>{candidate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Votes</span>
                      <span>{candidate.votes}</span>
                    </div>
                    <Progress value={candidate.percentage} />
                    <div className="flex justify-between text-sm">
                      <span>Percentage</span>
                      <span>{candidate.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {!hasVoted && (
          <div className="fixed bottom-4 right-4">
            <Button
              size="lg"
              onClick={handleVote}
              disabled={!selectedCandidate || isVoting}
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Casting Vote...
                </>
              ) : (
                "Cast Vote"
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
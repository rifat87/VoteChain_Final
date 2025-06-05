import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useContract, Candidate } from "@/hooks/useContract";
import { useEffect, useState } from "react";

export default function ElectionStatus() {
  const { toast } = useToast();
  const { getCandidates, isLoading: contractLoading, error: contractError, isInitialized } = useContract();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCandidates() {
      if (!mounted || !isInitialized) return;
      
      setLoading(true);
      setError(null);
      try {
        console.log('Starting to fetch candidates...');
        console.log('Contract loading state:', contractLoading);
        console.log('Contract error state:', contractError);
        const data = await getCandidates();
        if (!mounted) return;
        console.log('Raw candidate data received:', data);
        setCandidates(data);
      } catch (err) {
        if (!mounted) return;
        console.error('Error in fetchCandidates:', err);
        setError("Failed to fetch candidates");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (isInitialized) {
      fetchCandidates();
    }

    return () => {
      mounted = false;
    };
  }, [isInitialized, getCandidates, contractLoading, contractError]);

  const handleEndElection = () => {
    toast({
      title: "Election Ended",
      description: "The election has been ended (demo action).",
    });
  };

  // Demo election info (replace with real data if available)
  const demoElection = {
    name: "2025 National Election",
    status: "Ongoing",
    totalVotes: candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0),
    startedAt: "2025-06-01T15:00:00",
    endsAt: "2025-06-11T00:00:00",
  };

  if (loading || contractLoading) {
    return <div className="text-center py-8">Loading candidates...</div>;
  }
  if (error || contractError) {
    return <div className="text-center text-red-500 py-8">{error || contractError?.message}</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Election Status</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Election Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{demoElection.name}</span>
              <Badge variant={demoElection.status === "Ongoing" ? "default" : "secondary"}>
                {demoElection.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Started: {new Date(demoElection.startedAt).toLocaleString()}
              <br />
              Ends: {new Date(demoElection.endsAt).toLocaleString()}
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">Total Votes:</span> {demoElection.totalVotes}
            </div>
          </div>

          {/* Candidates Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Candidates</h3>
            <div className="space-y-4">
              {candidates.length === 0 ? (
                <div className="text-muted-foreground">No candidates found.</div>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-background/80 gap-2"
                  >
                    <div>
                      <div className="font-medium text-base">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">National ID: {candidate.nationalId}</div>
                      <div className="text-xs text-muted-foreground">Location: {candidate.location}</div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1 min-w-[140px]">
                      <span className="text-sm font-semibold">Votes: {candidate.voteCount}</span>
                      <Badge variant={candidate.isVerified ? "default" : "secondary"}>
                        {candidate.isVerified ? "Verified" : "Pending Verification"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button className="mt-8 w-full" onClick={handleEndElection}>
            End Election
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/components/ui/wallet-provider";
import { useLocalContract } from "@/local/hooks/useLocalContract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { CandidateList } from "@/components/Dashboard/CandidateList";

interface Candidate {
  id: number;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { getCandidates } = useLocalContract();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCandidate, setNewCandidate] = useState({ name: "", party: "" });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [getCandidates]);

  const handleAddCandidate = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add a candidate",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerCandidate(newCandidate.name, newCandidate.party);
      toast({
        title: "Success",
        description: "Candidate added successfully",
      });
      setNewCandidate({ name: "", party: "" });
      setIsAddingCandidate(false);
      await fetchCandidates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      });
    }
  };

  const handleEndElection = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to end the election",
        variant: "destructive",
      });
      return;
    }

    try {
      await endElection();
      toast({
        title: "Success",
        description: "Election ended successfully",
      });
      await fetchCandidates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end election",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Tabs defaultValue="candidates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
            <TabsTrigger value="voters">Registered Voters</TabsTrigger>
            <TabsTrigger value="results">Election Results</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Manage Candidates</h1>
                <p className="text-muted-foreground">
                  Add, remove, and manage election candidates.
                </p>
              </div>
              <Dialog open={isAddingCandidate} onOpenChange={setIsAddingCandidate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                    <DialogDescription>
                      Enter the candidate's details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="party">Party</Label>
                      <Input
                        id="party"
                        value={newCandidate.party}
                        onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCandidate}>Add Candidate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CandidateList 
                candidates={candidates} 
                isLoading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="voters" className="space-y-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Registered Voters</h1>
              <p className="text-muted-foreground">
                View and manage registered voters.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Voter list will be displayed here once implemented.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Election Results</h1>
                <p className="text-muted-foreground">
                  View detailed election results and statistics.
                </p>
              </div>
              <Button variant="destructive" onClick={handleEndElection}>
                End Election
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle>{candidate.name}</CardTitle>
                    <CardDescription>{candidate.party}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Votes</span>
                        <span>{candidate.votes}</span>
                      </div>
                      <Progress value={candidate.percentage} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 
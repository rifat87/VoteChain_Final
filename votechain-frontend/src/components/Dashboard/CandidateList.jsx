import React, { useState, useEffect } from "react";
import { getContract } from "../../utils/contract";

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contract = await getContract();
      const count = await contract.candidateCount();
      setCandidateCount(count.toString());

      let candidateArray = [];
      for (let i = 1; i <= count; i++) {
        const candidateData = await contract.getCandidate(i);
        candidateArray.push({
          id: candidateData.id.toString(),
          name: candidateData.name,
          voteCount: candidateData.voteCount.toString(),
        });
      }
      setCandidates(candidateArray);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError("Failed to fetch candidates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="card p-4 shadow-sm rounded">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Candidate List</h2>
        <button 
          onClick={fetchCandidates} 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      {isLoading && <div className="text-center">Loading candidates...</div>}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && candidates.length > 0 ? (
        <ul className="list-group">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{candidate.name}</strong>
                <span className="text-muted ml-2">(ID: {candidate.id})</span>
              </div>
              <span className="badge bg-primary rounded-pill">
                {candidate.voteCount} votes
              </span>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && !error && <p>No candidates registered yet.</p>
      )}
      
      <p className="mt-3 text-muted">Total Candidates: {candidateCount}</p>
    </div>
  );
};

export default CandidateList;

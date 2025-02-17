import React, { useState, useEffect } from "react";
import { getContract } from "../../utils/contract";

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
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
      }
    };
    fetchCandidates();
  }, []);

  return (
    <div className="card">
      <h2>Candidate List</h2>
      {candidates.length > 0 ? (
        <ul>
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              <strong>{candidate.name}</strong> (ID: {candidate.id}) - Votes: {candidate.voteCount}
            </li>
          ))}
        </ul>
      ) : (
        <p>No candidates registered yet.</p>
      )}
      <p>Total Candidates: {candidateCount}</p>
    </div>
  );
};

export default CandidateList;

import React, { useState } from "react";
import { getContract } from "../../utils/contract";

const VoteCasting = () => {
  const [candidateId, setCandidateId] = useState("");
  const [message, setMessage] = useState("");

  const handleCastVote = async (e) => {
    e.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      setMessage("Vote cast successfully!");
    } catch (error) {
      console.error("Error casting vote:", error);
      setMessage("Failed to cast vote.");
    }
  };

  return (
    <div className="card">
      <h2>Cast Your Vote</h2>
      <form onSubmit={handleCastVote}>
        <div>
          <label>Candidate ID:</label>
          <input
            type="number"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">Cast Vote</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VoteCasting;

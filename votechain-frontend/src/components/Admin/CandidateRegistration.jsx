import React, { useState } from "react";
import { getContract } from "../../utils/contract";

const CandidateRegistration = () => {
  const [candidateName, setCandidateName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.registerCandidate(candidateName);
      await tx.wait();
      setMessage("Candidate registered successfully!");
      setCandidateName("");
    } catch (error) {
      console.error("Error registering candidate:", error);
      setMessage("Failed to register candidate.");
    }
  };

  return (
    <div className="card">
      <h2>Register Candidate</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Candidate Name:</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">Register Candidate</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CandidateRegistration;

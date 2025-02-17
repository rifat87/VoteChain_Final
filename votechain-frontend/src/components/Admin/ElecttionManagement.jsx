import React, { useState, useEffect } from "react";
import { getContract } from "../../utils/contract";

const ElectionManagement = () => {
  const [electionEnded, setElectionEnded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const contract = await getContract();
        const status = await contract.electionEnded();
        setElectionEnded(status);
      } catch (error) {
        console.error("Error fetching election status:", error);
      }
    };
    fetchStatus();
  }, []);

  const handleEndElection = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.endElection();
      await tx.wait();
      setElectionEnded(true);
      setMessage("Election ended successfully!");
    } catch (error) {
      console.error("Error ending election:", error);
      setMessage("Failed to end election.");
    }
  };

  return (
    <div className="card">
      <h2>Election Management</h2>
      <p>
        <strong>Election Ended:</strong> {electionEnded ? "Yes" : "No"}
      </p>
      {!electionEnded && (
        <button onClick={handleEndElection} className="button">
          End Election
        </button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ElectionManagement;

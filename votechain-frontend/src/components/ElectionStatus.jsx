import React, { useState, useEffect } from "react";
import { getContract } from "../utils/contract";

const ElectionStatus = () => {
  const [isEnded, setIsEnded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const contract = await getContract();
        const status = await contract.electionEnded();
        setIsEnded(status);
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
      setIsEnded(true);
      setMessage("Election ended successfully!");
    } catch (error) {
      console.error("Error ending election:", error);
      setMessage("Failed to end election.");
    }
  };

  return (
    <div className="card">
      <h2>Election Status</h2>
      <p>
        <strong>Election Ended:</strong> {isEnded ? "Yes" : "No"}
      </p>
      {!isEnded && (
        <button onClick={handleEndElection} className="button">
          End Election
        </button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ElectionStatus;

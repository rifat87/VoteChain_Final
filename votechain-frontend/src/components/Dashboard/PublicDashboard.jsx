import React, { useState, useEffect } from "react";
import { getContract } from "../../utils/contract";
import CandidateList from "./CandidateList";

const PublicDashboard = () => {
  const [electionEnded, setElectionEnded] = useState(false);

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

  return (
    <div className="card">
      <h1>Public Election Dashboard</h1>
      <p>
        <strong>Election Status:</strong> {electionEnded ? "Ended" : "Active"}
      </p>
      <CandidateList />
    </div>
  );
};

export default PublicDashboard;

import React, { useState } from "react";
import { getContract } from "../../utils/contract";

const VoterRegistration = () => {
  const [voterAddress, setVoterAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contract = await getContract();
      const tx = await contract.registerVoter(voterAddress);
      await tx.wait();
      setMessage("Voter registered successfully!");
      setVoterAddress("");
    } catch (error) {
      console.error("Error registering voter:", error);
      setMessage("Failed to register voter.");
    }
  };

  return (
    <div className="card">
      <h2>Register Voter</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Voter Address:</label>
          <input
            type="text"
            value={voterAddress}
            onChange={(e) => setVoterAddress(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button">Register Voter</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VoterRegistration;

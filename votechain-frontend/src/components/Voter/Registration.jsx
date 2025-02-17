import React, { useState } from "react";

const Registration = () => {
  const [message, setMessage] = useState("");

  // In a real dApp, you might call a backend API or interact with a contract here.
  const handleRegister = () => {
    // Simulate registration success.
    setMessage("Registration successful! Please complete biometric authentication.");
  };

  return (
    <div className="card">
      <h2>Voter Registration</h2>
      <button onClick={handleRegister} className="button">Register as Voter</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Registration;

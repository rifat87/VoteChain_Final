import React, { useState } from "react";

// For demonstration, we'll simulate biometric authentication.
// In a real-world scenario, integrate with a biometric library (e.g., face-api.js).
const BiometricAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuthenticate = () => {
    // Simulate successful biometric authentication.
    setAuthenticated(true);
    setMessage("Biometric authentication successful!");
  };

  return (
    <div className="card">
      <h2>Biometric Authentication</h2>
      {!authenticated ? (
        <button onClick={handleAuthenticate} className="button">
          Authenticate via Biometrics
        </button>
      ) : (
        <p>Authenticated</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default BiometricAuth;

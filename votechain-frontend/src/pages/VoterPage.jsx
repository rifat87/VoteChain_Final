import React from "react";
import Registration from "../components/Voter/Registration";
import BiometricAuth from "../components/Voter/BiometricAuth";
import VoteCasting from "../components/Voter/VoteCasting";

const VoterPage = () => {
  return (
    <div>
      <h1>Voter Dashboard</h1>
      <Registration />
      <BiometricAuth />
      <VoteCasting />
    </div>
  );
};

export default VoterPage;

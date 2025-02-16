import React from "react";
import CandidateRegistration from "./CandidateRegistration";
import VoterRegistration from "./VoterRegistration";
import CastVote from "./CastVote";
import ElectionStatus from "./ElectionStatus";

const Voting = () => {
  return (
    <div>
      <h1>Voting DApp Dashboard</h1>
      <ElectionStatus />
      <CandidateRegistration />
      <VoterRegistration />
      <CastVote />
    </div>
  );
};

export default Voting;

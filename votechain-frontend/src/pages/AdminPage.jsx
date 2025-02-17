import React from "react";
import CandidateRegistration from "../components/Admin/CandidateRegistration";
import VoterRegistration from "../components/Admin/VoterRegistration";
import ElectionManagement from "../components/Admin/ElecttionManagement";

const AdminPage = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ElectionManagement />
      <CandidateRegistration />
      <VoterRegistration />
    </div>
  );
};

export default AdminPage;

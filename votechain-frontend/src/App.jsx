import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import VoterPage from "./pages/VoterPage";

function App() {
  return (
    <Router>
      <div>
        {/* Optionally add a Navigation component here */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/voter" element={<VoterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

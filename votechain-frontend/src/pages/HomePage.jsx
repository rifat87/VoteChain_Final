import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getContract } from "../../src/utils/contract";
import PublicDashboard from "../components/Dashboard/PublicDashboard";

const HomePage = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const navigate = useNavigate();

  // Check if wallet is already connected when the component mounts.
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setWalletConnected(true);
          setAccount(accounts[0]);
          determineRole(accounts[0]);
        }
      }
    };
    checkWalletConnection();
  }, []);

  // Function to determine the user's role.
  const determineRole = async (userAccount) => {
    try {
      const contract = await getContract();
      const admin = await contract.electionCommission();
      console.log("The admin value: ", admin.toLowerCase());
      // If the connected account matches the admin, navigate to admin page.
      if (userAccount.toLowerCase() === admin.toLowerCase()) {
        navigate("/admin");
      } else {
        navigate("/voter");
      }
    } catch (error) {
      console.error("Error determining role:", error);
      console.log("The error message is : ", error.message);
      alert(error.message);
    }
  };

  // Function to prompt wallet connection.
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWalletConnected(true);
          setAccount(accounts[0]);
          determineRole(accounts[0]);
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div>
      <PublicDashboard />
      {!walletConnected && (
        <div className="card">
          <h2>Connect Your Wallet</h2>
          <button onClick={connectWallet} className="button">
            Connect Wallet
          </button>
        </div>
      )}
      {walletConnected && (
        <p>Wallet connected: {account}. Determining role...</p>
      )}
    </div>
  );
};

export default HomePage;

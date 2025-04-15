import React from "react";
import { ethers } from "ethers";
import "../App.css";

const Home = ({ onConnect }) => {
  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            onConnect(signer); // This is a real Signer object
          }
      } catch (err) {
        console.error("Wallet connection failed:", err);
        alert("Wallet connection failed. Make sure MetaMask is installed.");
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask and try again.");
    }
  };

  return (
    <div className="home-container">
      <h1 className="mt-5">💸 Expense Splitter DApp</h1>
      <p className="lead mb-4">
        Fairly split group expenses with full transparency using Web3.
      </p>

      <button className="btn btn-success btn-lg" onClick={handleConnect}>
        Connect MetaMask Wallet
      </button>

      <h3 className="section-title">✨ Features to Simplify Expense Splitting</h3>

      <div className="feature-grid mt-4">
        <div className="feature-card">
          ✅ <strong>Create groups</strong><br />
          Easily form and manage shared expense groups.
        </div>
        <div className="feature-card">
          📊 <strong>Split expenses</strong><br />
          Equal or custom splits — your choice.
        </div>
        <div className="feature-card">
          🔍 <strong>Track balances</strong><br />
          Real-time updates and full history.
        </div>
        <div className="feature-card">
          🔐 <strong>Smart contracts</strong><br />
          Transparent and secure on-chain transactions.
        </div>
      </div>
    </div>
  );
};

export default Home;

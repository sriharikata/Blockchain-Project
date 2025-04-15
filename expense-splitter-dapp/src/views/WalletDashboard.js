import React, { useEffect, useState } from "react";
import { formatEther, BrowserProvider } from "ethers";

export default function WalletDashboard({ signer }) {
  const [address, setAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");
  const [myGroups, setMyGroups] = useState([]);

  // Fetch wallet address and balance
  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (signer) {
        const addr = await signer.getAddress();
        setAddress(addr);

        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(addr);
        setWalletBalance(formatEther(balance));
      }
    };

    fetchWalletInfo();
  }, [signer]);

  // Fetch all groups and filter for the logged-in user
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const addr = await signer.getAddress();
        // const res = await fetch("http://localhost:5000/api/groups");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`);
        const allGroups = await res.json();

        const filtered = allGroups.filter((group) =>
          group.members.some((m) =>
            m.address.toLowerCase() === addr.toLowerCase()
          )
        );

        setMyGroups(filtered);
      } catch (err) {
        console.error("Failed to load groups:", err);
      }
    };

    if (signer) fetchGroups();
  }, [signer]);

  return (
    <div className="container mt-5">
      {/* Wallet Info */}
      <div className="card mb-4">
        <div className="card-body text-center">
          <h4>🎉 Welcome to Your Dashboard</h4>
          <p className="mb-1 text-muted">Connected Wallet:</p>
          <h6 className="text-primary">{address}</h6>
          <p className="mt-2">
            <span className="badge bg-success fs-6">
              💰 Wallet Balance: {walletBalance} ETH
            </span>
          </p>
        </div>
      </div>

      {/* My Groups and Placeholder for Balances */}
      <div className="row">
        {/* My Groups */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header fw-semibold">📂 My Groups</div>
            <div className="card-body">
              {myGroups.length > 0 ? (
                myGroups.map((group) => (
                  <div key={group.groupId} className="mb-3 p-2 border rounded">
                    <h6 className="mb-1">{group.groupName}</h6>
                    <p className="text-muted small mb-1">👥 Members:</p>
                    <ul className="ps-3 mb-0">
                      {group.members.map((m, idx) => (
                        <li key={idx} className="small">
                          {m.name} ({m.address.slice(0, 6)}...{m.address.slice(-4)})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-muted">You’re not part of any groups yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Overview (placeholder) */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header fw-semibold">📊 Financial Overview</div>
            <div className="card-body">
              <p className="text-muted">No balances available yet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-header fw-semibold">🕓 Recent Activity</div>
            <div className="card-body">
              <p className="text-muted">No recent transactions yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

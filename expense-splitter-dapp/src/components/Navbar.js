import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";

export default function Navbar({ setView, setSigner, signer, view }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");

  const connect = async () => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signerObj = await provider.getSigner();
      setSigner(signerObj);

      const addr = await signerObj.getAddress();
      setAccount(addr);

      const bal = await provider.getBalance(addr);
      setBalance(formatEther(bal));
      setView("dashboard");
    } else {
      alert("Please install MetaMask");
    }
  };

  // Keep account and balance synced when signer changes
  useEffect(() => {
    const update = async () => {
      if (signer) {
        const addr = await signer.getAddress();
        setAccount(addr);

        const provider = new BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(addr);
        setBalance(formatEther(bal));
      }
    };
    update();
  }, [signer]);

  const isHomeAndNotConnected = view === "home" && !signer;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom py-3 px-4 shadow-sm sticky-top">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold text-info">
          <i className="fas fa-coins me-2"></i>Expense Splitter
        </span>

        <div className="d-flex ms-auto gap-3 align-items-center">
          {!isHomeAndNotConnected && (
            <>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => setView("dashboard")}
              >
                Dashboard
              </button>
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => setView("groups")}
              >
               Groups
              </button>

              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => setView("create")}
              >
                Create Group
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setView("add")}
              >
                Add Expense
              </button>
            </>
          )}

          {account && (
            <>
              <span className="text-light small">
                💰Balance {parseFloat(balance).toFixed(4)} ETH
              </span>
              <span className="text-light small">
                🔗 {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </>
          )}

          {!isHomeAndNotConnected && !account && (
            <button className="btn btn-success btn-sm" onClick={connect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

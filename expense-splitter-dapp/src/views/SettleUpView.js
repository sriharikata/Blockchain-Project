import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { parseEther } from "ethers";

export default function SettleUpView({ signer, group, setView }) {
  const [balances, setBalances] = useState({});
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [isSettling, setIsSettling] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      const addr = (await signer.getAddress()).toLowerCase();

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/expenses/group/${group.groupId}/balance`
      );
      const balanceMap = await res.json();

      const owedTo = group.members.filter((member) => {
        const memberName = member.name;
        const memberAddr = member.address.toLowerCase();
        const balance = balanceMap[memberName];

        return memberAddr !== addr && balance > 0;
      });

      const balancesFiltered = {};
      owedTo.forEach((m) => {
        const amt = balanceMap[m.name];
        balancesFiltered[m.name] = {
          address: m.address,
          amount: parseFloat(amt).toFixed(4),
        };
      });

      setBalances(balancesFiltered);

      const first = Object.keys(balancesFiltered)[0];
      if (first) {
        setRecipient(first);
        setAmount(balancesFiltered[first].amount);
      }
    };

    fetchBalances();
  }, [group, signer]);

  const handleSettle = async () => {
    try {
      setIsSettling(true);
      const recipientAddress = balances[recipient].address;
      const ethValue = parseEther(amount.toString());

      const contract = getContract(signer);
      const tx = await contract.settleUp(recipientAddress, {
        value: ethValue,
      });

      await tx.wait();
      await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.groupId,
          from: (await signer.getAddress()).toLowerCase(),
          to: balances[recipient].address,
          amount,
          txHash: tx.hash
        }),
      });
      
      setSuccess(true);

      // ✅ Update local balances
      const updated = { ...balances };
      updated[recipient].amount = "0.0000";
      setBalances(updated);

      // ✅ Redirect back to groups
      setTimeout(() => {
        setView("groups");
      }, 1500);
    } catch (err) {
      console.error("Settle failed:", err);
      alert("❌ Transaction failed.");
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="container mt-5">
      <h3>💸 Settle Up – {group.groupName}</h3>

      {Object.keys(balances).length === 0 ? (
        <p className="text-muted mt-4">You don’t owe anyone in this group.</p>
      ) : (
        <div className="mt-4">
          <div className="mb-3">
            <label className="form-label">Select Member</label>
            <select
              className="form-select"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setAmount(balances[e.target.value].amount);
              }}
              disabled={success}
            >
              {Object.entries(balances).map(([name, info]) => (
                <option key={name} value={name}>
                  {name} – {info.amount} ETH
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Amount (ETH)</label>
            <input
              type="text"
              className="form-control"
              value={amount}
              disabled
            />
          </div>

          {success ? (
            <div className="alert alert-success">
              ✅ Payment successful! Redirecting...
            </div>
          ) : (
            <>
              <button
                className="btn btn-success me-2"
                onClick={handleSettle}
                disabled={isSettling}
              >
                {isSettling ? "Settling..." : "Confirm Payment"}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setView("groups")}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

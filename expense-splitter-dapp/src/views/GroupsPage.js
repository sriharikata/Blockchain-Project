import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { parseEther } from "ethers";

export default function GroupsPage({ signer, setView, setSelectedGroup }) {
  const [address, setAddress] = useState("");
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupsAndBalances = async () => {
      try {
        const addr = await signer.getAddress();
        setAddress(addr);

        // const res = await fetch("http://localhost:5000/api/groups");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`);
        const allGroups = await res.json();

        const myGroups = allGroups.filter(group =>
          group.members.some(m =>
            m.address.toLowerCase() === addr.toLowerCase()
          )
        );

        const balanceMap = {};
        for (let group of myGroups) {
          try {
            // const balRes = await fetch(`http://localhost:5000/api/expenses/group/${group.groupId}/balance`);
            const balRes = await fetch(`${process.env.REACT_APP_API_URL}/api/group/${group.groupId}/balance`);
            const groupBalances = await balRes.json();
            balanceMap[group.groupId] = groupBalances;
          } catch (err) {
            console.warn(`Failed to fetch balances for ${group.groupName}:`, err);
          }
        }

        setGroups(myGroups);
        setBalances(balanceMap);
      } catch (err) {
        console.error("Group fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (signer) fetchGroupsAndBalances();
  }, [signer]);

  const handleSettleUp = (group) => {
    setSelectedGroup(group);
    setView("settle");
  };

  const openActivity = (groupId) => {
    console.log("Open activity for:", groupId);
    // TODO: Modal or redirect
  };

  if (loading) return <div className="text-center mt-4">Loading your groups...</div>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">📋 Your Groups</h3>

      {groups.length === 0 ? (
        <p>You are not part of any groups yet.</p>
      ) : (
        groups.map(group => {
          const groupBalances = balances[group.groupId] || {};
          const members = group.members;

          const memberMap = {};
          const addressMap = {};

          members.forEach(m => {
            memberMap[m.name] = m.address.toLowerCase();
            addressMap[m.address.toLowerCase()] = m.name;
          });

          const lowerAddr = address.toLowerCase();
          const yourName = addressMap[lowerAddr];
          const yourOwnBalance = groupBalances[yourName] || 0;

          let yourText = "You're all settled in this group";
          let yourColor = "black";

          if (yourOwnBalance > 0) {
            yourText = `You owe ${yourOwnBalance.toFixed(4)} ETH`;
            yourColor = "red";
          } else if (yourOwnBalance < 0) {
            yourText = `You are owed ${Math.abs(yourOwnBalance).toFixed(4)} ETH`;
            yourColor = "green";
          }

          return (
            <div key={group.groupId} className="card mb-4 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{group.groupName}</h5>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => openActivity(group.groupId)}
                  >
                    Activity
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleSettleUp(group)}
                  >
                    Settle Up
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontWeight: "bold", color: yourColor }}>{yourText}</p>
                <hr />

                {Object.entries(groupBalances).map(([name, amount]) => {
                  if (name === yourName) return null;

                  const absAmount = Math.abs(amount).toFixed(4);

                  // 🟢 They owe you
                  if (yourOwnBalance < 0 && amount < 0) {
                    return (
                      <div key={name} className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          {name} owes you {absAmount} ETH
                        </span>
                      </div>
                    );
                  }

                  // 🔴 You owe someone with positive balance
                  if (yourOwnBalance > 0 && groupBalances[name] > 0) {
                    return (
                      <div key={name} className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          You owe {name} {yourOwnBalance.toFixed(4)} ETH
                        </span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

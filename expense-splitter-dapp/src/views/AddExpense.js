import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

export default function AddExpense({ setView }) {
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [group, setGroup] = useState(null);

  const [paidBy, setPaidBy] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splitDetails, setSplitDetails] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGroups = async () => {
      // const res = await fetch("http://localhost:5000/api/groups");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`);
      const data = await res.json();
      setAllGroups(data);
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const selected = allGroups.find((g) => g.groupId === selectedGroupId);
    if (selected) {
      setGroup(selected);
      const initialSplit = {};
      selected.members.forEach((m) => {
        initialSplit[m.address] = "";
      });
      setSplitDetails(initialSplit);
    }
  }, [selectedGroupId, allGroups]);

  useEffect(() => {
    const fetchConnectedWallet = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        const match = group?.members.find((m) => m.address.toLowerCase() === addr.toLowerCase());
        setPaidBy(match ? match.address : addr);
      } catch (err) {
        console.error("Auto-fill wallet failed", err);
      }
    };

    if (group) fetchConnectedWallet();
  }, [group]);

  const calculateEqualSplit = () => {
    if (!group || !amount) return {};
    const perPerson = parseFloat(amount) / group.members.length;
    const result = {};
    group.members.forEach((m) => {
      result[m.address] = perPerson.toFixed(4);
    });
    return result;
  };

  const handleSplitChange = (address, value) => {
    setSplitDetails((prev) => ({
      ...prev,
      [address]: value
    }));
  };

  const handleSubmit = async () => {
    setError("");

    const total = parseFloat(amount);
    const splitBetween =
      splitType === "equal"
        ? Object.keys(calculateEqualSplit())
        : Object.keys(splitDetails).filter((addr) => parseFloat(splitDetails[addr]) > 0);

    const finalSplit =
      splitType === "equal" ? calculateEqualSplit() : splitDetails;

    // ✅ Manual Split Validation
    if (splitType === "manual") {
      const totalSplit = Object.values(finalSplit).reduce(
        (sum, v) => sum + parseFloat(v || 0), 0
      );

      if (Math.abs(total - totalSplit) > 0.0001) {
        setError(`Total split (${totalSplit.toFixed(4)} ETH) does not match entered amount (${total} ETH).`);
        return;
      }
    }

    const payload = {
      groupId: selectedGroupId,
      paidBy,
      amount: total,
      description,
      splitBetween,
      splitDetails: finalSplit
    };

    // const res = await fetch("http://localhost:5000/api/expenses", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload)
    // });

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.expenseId) {
      alert("✅ Expense added!");
      setView("dashboard"); // 🔁 Redirect after success
    } else {
      alert("❌ Failed to add expense");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Expense</h3>

      <div className="mb-3">
        <label>Select Group:</label>
        <select
          className="form-select"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
        >
          <option value="">-- Select a Group --</option>
          {allGroups.map((g) => (
            <option key={g.groupId} value={g.groupId}>
              {g.groupName}
            </option>
          ))}
        </select>
      </div>

      {group && (
        <>
          <div className="mb-3">
            <label>Paid By (Your Wallet Address):</label>
            <input
              className="form-control"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Description:</label>
            <input
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Amount in ETH:</label>
            <input
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Split Type:</label>
            <select
              className="form-select"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
            >
              <option value="equal">Equal Split</option>
              <option value="manual">Manual Split</option>
            </select>
          </div>

          <div className="mb-4">
            <label>Split Between:</label>
            {group.members.map((m, idx) => (
              <div key={idx} className="mb-2">
                <strong>{m.name}</strong> ({m.address.slice(0, 6)}...{m.address.slice(-4)})
                <input
                  type="text"
                  className="form-control mt-1"
                  disabled={splitType === "equal"}
                  value={
                    splitType === "equal"
                      ? calculateEqualSplit()[m.address]
                      : splitDetails[m.address]
                  }
                  onChange={(e) => handleSplitChange(m.address, e.target.value)}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Expense
          </button>
        </>
      )}
    </div>
  );
}

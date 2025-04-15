import { useState } from "react";
import { getContract } from "../utils/contract";
import { parseEther } from "ethers";

export default function ContractActions({ signer }) {
    const [depositAmount, setDepositAmount] = useState("");
    const [splitRows, setSplitRows] = useState([{ address: "", amount: "" }]);

    const deposit = async () => {
        try {
            const contract = getContract(signer);
            const tx = await contract.deposit({
                value: parseEther(depositAmount)
            });
            await tx.wait();
            alert("✅ Deposit successful!");
        } catch (error) {
            console.error("❌ Deposit failed:", error);
            alert("❌ " + (error?.message || "Deposit failed"));
        }
    };

    const splitExpense = async () => {
        try {
            const contract = getContract(signer);
            const addresses = splitRows.map(row => row.address.trim());
            const amounts = splitRows.map(row => parseEther(row.amount.trim()));
            const tx = await contract.splitExpense(addresses, amounts);
            await tx.wait();
            alert("✅ Split successful!");
        } catch (error) {
            console.error("❌ Split failed:", error);
            alert("❌ " + (error?.message || "Split failed"));
        }
    };

    const updateRow = (index, field, value) => {
        const updated = [...splitRows];
        updated[index][field] = value;
        setSplitRows(updated);
    };

    const addRow = () => {
        setSplitRows([...splitRows, { address: "", amount: "" }]);
    };

    const removeRow = (index) => {
        const updated = splitRows.filter((_, i) => i !== index);
        setSplitRows(updated);
    };

    return (
        <div className="container mt-4">
            <h3>💸 Deposit ETH</h3>
            <input
                className="form-control mb-2"
                placeholder="Amount in ETH"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button className="btn btn-success mb-4" onClick={deposit}>Deposit</button>

            <h3>📤 Split Expense</h3>
            {splitRows.map((row, index) => (
                <div className="row mb-2" key={index}>
                    <div className="col-md-5">
                        <input
                            className="form-control"
                            placeholder="Recipient Address"
                            value={row.address}
                            onChange={(e) => updateRow(index, "address", e.target.value)}
                        />
                    </div>
                    <div className="col-md-5">
                        <input
                            className="form-control"
                            placeholder="Amount in ETH"
                            value={row.amount}
                            onChange={(e) => updateRow(index, "amount", e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-danger" onClick={() => removeRow(index)}>Remove</button>
                    </div>
                </div>
            ))}
            <div className="mb-3">
                <button className="btn btn-secondary me-2" onClick={addRow}>+ Add More</button>
                <button className="btn btn-warning" onClick={splitExpense}>Split</button>
            </div>
        </div>
    );
}

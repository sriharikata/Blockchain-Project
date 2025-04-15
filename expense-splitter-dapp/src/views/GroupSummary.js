import { useEffect, useState } from "react";

export default function GroupSummary({ groupId }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        // const expRes = await fetch(`http://localhost:5000/api/expenses/group/${groupId}`);
        // const balRes = await fetch(`http://localhost:5000/api/expenses/group/${groupId}/balance`);

        const expRes = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/group/${groupId}`);
        const balRes = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/group/${groupId}/balance`);

        const expenses = await expRes.json();
        const balances = await balRes.json();

        setExpenses(expenses);
        setBalances(balances);
      } catch (err) {
        console.error("Failed to load group data:", err);
      }
    };
    load();
  }, [groupId]);

  return (
    <div>
      <h3>📒 Expense History</h3>
      <ul className="list-group mb-4">
        {expenses.map((e) => (
          <li className="list-group-item" key={e.expenseId}>
            <strong>{e.paidBy}</strong> paid <strong>{e.amount} ETH</strong> for "{e.description}"
          </li>
        ))}
      </ul>

      <h3>📊 Who Owes What</h3>
      <ul className="list-group">
        {Object.entries(balances).map(([name, amount]) => (
          <li key={name} className="list-group-item">
            <strong>{name}</strong>: {amount} ETH
          </li>
        ))}
      </ul>
    </div>
  );
}

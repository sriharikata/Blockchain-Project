import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { formatEther } from "ethers";

export default function BalanceDisplay({ signer }) {
    const [balance, setBalance] = useState("0");

    const fetchBalance = async () => {
        try {
            const contract = getContract(signer);
            const bal = await contract.getBalance();
            setBalance(formatEther(bal));
        } catch (error) {
            console.error("Failed to fetch balance:", error);
        }
    };

    useEffect(() => {
        if (signer) {
            fetchBalance();

            // Optional: auto-refresh every 10 seconds
            const interval = setInterval(fetchBalance, 10000);
            return () => clearInterval(interval);
        }
    }, [signer]);

    return (
        <div className="text-center mt-4">
            <h4>📊 Contract Balance: {balance} ETH</h4>
        </div>
    );
}
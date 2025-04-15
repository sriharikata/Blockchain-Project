import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";

export default function ConnectWallet({ setSigner }) {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState("0");

    const connect = async () => {
        if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            setSigner(signer);
            const addr = await signer.getAddress();
            setAccount(addr);

            const bal = await provider.getBalance(addr);
            setBalance(formatEther(bal));
        } else {
            alert("Please install MetaMask");
        }
    };

    return (
        <div className="text-end my-3">
            <button className="btn btn-primary me-2" onClick={connect}>
                {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
            </button>
            {account && <span>💰 {balance} ETH</span>}
        </div>
    );
}

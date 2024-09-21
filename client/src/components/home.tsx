import { useEffect, useState } from "react";
import { ethers } from "ethers";

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    }
  };

  return (
    <div>
      <header>
        <h1>NFT Gated Event Manager</h1>
        <ConnectButton />
      </header>
    </div>
  );
}

export default App;

import { useState } from "react";
import { ethers } from "ethers";

/* 🔴 PUT YOUR REAL CONTRACT ADDRESSES */
const tokenAAddress = "0x88243e665dee3db495a094bb29dbd49f8472fb26";
const tokenBAddress = "0x2dc037c600887a3ea87356e44dd02b51977a37ab";
const poolAddress = "0xc40b59d80b018c1f275e0baf509f7c77583e7966";

/* ERC20 ABI */
const tokenABI = [
  "function approve(address spender, uint256 amount) returns (bool)"
];

/* POOL ABI */
const poolABI = [
  "function addLiquidity(uint256 amountA, uint256 amountB)",
  "function swapAforB(uint256 amountA)"
];

function App() {
  const [account, setAccount] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [swapAmount, setSwapAmount] = useState("");

  /* CONNECT WALLET */
  async function connectWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  /* ADD LIQUIDITY */
  async function addLiquidity() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenA = new ethers.Contract(tokenAAddress, tokenABI, signer);
    const tokenB = new ethers.Contract(tokenBAddress, tokenABI, signer);
    const pool = new ethers.Contract(poolAddress, poolABI, signer);

    const valueA = ethers.parseEther(amountA);
    const valueB = ethers.parseEther(amountB);

    await tokenA.approve(poolAddress, valueA);
    await tokenB.approve(poolAddress, valueB);
    await pool.addLiquidity(valueA, valueB);

    alert("Liquidity Added!");
  }

  /* SWAP TOKENS */
  async function swapTokens() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenA = new ethers.Contract(tokenAAddress, tokenABI, signer);
    const pool = new ethers.Contract(poolAddress, poolABI, signer);

    const amount = ethers.parseEther(swapAmount);

    await tokenA.approve(poolAddress, amount);
    await pool.swapAforB(amount);

    alert("Swap Successful!");
  }

  return (
    <div>
      <h1>My DEX</h1>

      {!account ? (
        <button onClick={connectWallet}>
          Connect MetaMask
        </button>
      ) : (
        <>
          <p>Connected: {account}</p>

          <div>
            <h2>Add Liquidity</h2>
            <input
              placeholder="TokenA Amount"
              onChange={(e) => setAmountA(e.target.value)}
            />
            <input
              placeholder="TokenB Amount"
              onChange={(e) => setAmountB(e.target.value)}
            />
            <button onClick={addLiquidity}>
              Add Liquidity
            </button>
          </div>

          <div>
            <h2>Swap TKA → TKB</h2>
            <input
              placeholder="Amount to swap"
              onChange={(e) => setSwapAmount(e.target.value)}
            />
            <button onClick={swapTokens}>
              Swap Tokens
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
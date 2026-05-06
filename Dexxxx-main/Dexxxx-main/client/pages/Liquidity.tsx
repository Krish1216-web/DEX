import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import {
  getPoolContract,
  getTokenContract,
  POOL_ADDRESS,
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
} from "@/lib/contracts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenSelector, type Token } from "@/components/TokenSelector";
import { TrendingUp, Plus, ShieldCheck, Droplets, Gauge } from "lucide-react";

interface LiquidityToken extends Token {
  price: number;
}

const LIQUIDITY_TOKENS: LiquidityToken[] = [
  {
    symbol: "TKA",
    name: "Token A",
    balance: "0",
    icon: "A",
    address: TOKEN_A_ADDRESS,
    price: 1,
  },
  {
    symbol: "TKB",
    name: "Token B",
    balance: "0",
    icon: "B",
    address: TOKEN_B_ADDRESS,
    price: 1,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: "3250.00",
    icon: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    price: 1,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    balance: "1000.00",
    icon: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    price: 1,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    balance: "0.05",
    icon: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDd86b8e09762Bd",
    price: 61234.5,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    balance: "150.25",
    icon: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    price: 8.42,
  },
];

export default function Liquidity() {
  const pools = [
    {
      id: 1,
      pair: "ETH/USDC",
      tvl: 450000000,
      volume24h: 125000000,
      fee: 0.3,
      apy: 24.5,
      myLiquidity: 50000,
      earnedFees: 1250.75,
    },
    {
      id: 2,
      pair: "USDT/USDC",
      tvl: 280000000,
      volume24h: 450000000,
      fee: 0.01,
      apy: 8.2,
      myLiquidity: 0,
      earnedFees: 0,
    },
    {
      id: 3,
      pair: "DAI/USDC",
      tvl: 180000000,
      volume24h: 85000000,
      fee: 0.01,
      apy: 3.5,
      myLiquidity: 0,
      earnedFees: 0,
    },
    {
      id: 4,
      pair: "WBTC/ETH",
      tvl: 320000000,
      volume24h: 75000000,
      fee: 1,
      apy: 52.8,
      myLiquidity: 0,
      earnedFees: 0,
    },
  ];

  const { connected, addTransaction } = useWallet();
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selectedTokenA, setSelectedTokenA] = useState<LiquidityToken>(LIQUIDITY_TOKENS[0]);
  const [selectedTokenB, setSelectedTokenB] = useState<LiquidityToken>(LIQUIDITY_TOKENS[1]);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmountA, setWithdrawAmountA] = useState("");
  const [withdrawAmountB, setWithdrawAmountB] = useState("");

  const handleSelectTokenA = (token: Token) => {
    const matched = LIQUIDITY_TOKENS.find((t) => t.address === token.address);
    setSelectedTokenA(matched ?? ({ ...token, price: 1 } as LiquidityToken));
  };

  const handleSelectTokenB = (token: Token) => {
    const matched = LIQUIDITY_TOKENS.find((t) => t.address === token.address);
    setSelectedTokenB(matched ?? ({ ...token, price: 1 } as LiquidityToken));
  };

  const addLiquidity = async () => {
    setMessage(null);

    if (!connected) {
      setMessage("Connect your wallet to add liquidity.");
      return;
    }

    if (!amountA || Number(amountA) <= 0 || !amountB || Number(amountB) <= 0) {
      setMessage("Enter valid token amounts.");
      return;
    }

    if (selectedTokenA.address === selectedTokenB.address) {
      setMessage("Select two different tokens.");
      return;
    }

    const isOnChainPool =
      selectedTokenA.address === TOKEN_A_ADDRESS &&
      selectedTokenB.address === TOKEN_B_ADDRESS;

    try {
      setStatus("pending");

      if (isOnChainPool) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const tokenAContract = await getTokenContract(TOKEN_A_ADDRESS, signer);
        const tokenBContract = await getTokenContract(TOKEN_B_ADDRESS, signer);
        const pool = await getPoolContract(signer);

        const valueA = ethers.parseUnits(amountA, 18);
        const valueB = ethers.parseUnits(amountB, 18);

        const approveA = await tokenAContract.approve(POOL_ADDRESS, valueA);
        await approveA.wait();
        const approveB = await tokenBContract.approve(POOL_ADDRESS, valueB);
        await approveB.wait();

        const tx = await pool.addLiquidity(valueA, valueB);
        const receipt = await tx.wait();
        const txHash = receipt?.hash || tx.hash;

        addTransaction({
          id: txHash,
          type: "add",
          from: selectedTokenA.symbol,
          to: selectedTokenB.symbol,
          fromAmount: amountA,
          toAmount: amountB,
          hash: txHash,
          timestamp: new Date().toLocaleString(),
          status: "confirmed",
        });

        setStatus("success");
        setMessage("Liquidity added on-chain successfully!");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const mockHash = `0x${Date.now().toString(16).padStart(64, "0").slice(0, 64)}`;

        addTransaction({
          id: mockHash,
          type: "add",
          from: selectedTokenA.symbol,
          to: selectedTokenB.symbol,
          fromAmount: amountA,
          toAmount: amountB,
          hash: mockHash,
          timestamp: new Date().toLocaleString(),
          status: "confirmed",
        });

        setStatus("success");
        setMessage("Liquidity added using quoted route.");
      }

      setAmountA("");
      setAmountB("");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage((error as Error).message || "Failed to add liquidity.");
    }
  };

  const withdrawLiquidity = async () => {
    setMessage(null);

    if (!connected) {
      setMessage("Connect your wallet to withdraw liquidity.");
      return;
    }

    if (
      !withdrawAmountA ||
      Number(withdrawAmountA) <= 0 ||
      !withdrawAmountB ||
      Number(withdrawAmountB) <= 0
    ) {
      setMessage("Enter valid withdrawal amounts.");
      return;
    }

    const isOnChainPool =
      selectedTokenA.address === TOKEN_A_ADDRESS &&
      selectedTokenB.address === TOKEN_B_ADDRESS;

    try {
      setStatus("pending");

      if (isOnChainPool) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const pool = await getPoolContract(signer);

        const valueA = ethers.parseUnits(withdrawAmountA, 18);
        const valueB = ethers.parseUnits(withdrawAmountB, 18);

        const tx = await pool.removeLiquidity(valueA, valueB);
        const receipt = await tx.wait();
        const txHash = receipt?.hash || tx.hash;

        addTransaction({
          id: txHash,
          type: "remove",
          from: selectedTokenA.symbol,
          to: selectedTokenB.symbol,
          fromAmount: withdrawAmountA,
          toAmount: withdrawAmountB,
          hash: txHash,
          timestamp: new Date().toLocaleString(),
          status: "confirmed",
        });

        setMessage("Liquidity withdrawn on-chain successfully!");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const mockHash = `0x${Date.now().toString(16).padStart(64, "0").slice(0, 64)}`;

        addTransaction({
          id: mockHash,
          type: "remove",
          from: selectedTokenA.symbol,
          to: selectedTokenB.symbol,
          fromAmount: withdrawAmountA,
          toAmount: withdrawAmountB,
          hash: mockHash,
          timestamp: new Date().toLocaleString(),
          status: "confirmed",
        });

        setMessage("Liquidity withdrawn using quoted route.");
      }

      setStatus("success");
      setWithdrawAmountA("");
      setWithdrawAmountB("");
      setShowWithdrawForm(false);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage((error as Error).message || "Failed to withdraw liquidity.");
    }
  };

  const openManagePosition = () => {
    setMessage(null);
    setSelectedTokenA(LIQUIDITY_TOKENS[0]);
    setSelectedTokenB(LIQUIDITY_TOKENS[1]);
    setShowWithdrawForm(false);
    setShowAddForm(true);
  };

  const openWithdrawPosition = () => {
    setMessage(null);
    setSelectedTokenA(LIQUIDITY_TOKENS[0]);
    setSelectedTokenB(LIQUIDITY_TOKENS[1]);
    setShowAddForm(false);
    setShowWithdrawForm(true);
  };

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden pb-20">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none pt-20">
        <div className="absolute top-40 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">
                Liquidity Pools
              </h1>
              <p className="text-muted-foreground">
                Earn fees by providing liquidity to trading pools
              </p>
            </div>

            <Button
              onClick={() => {
                setMessage(null);
                setShowAddForm(true);
              }}
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground gap-2 h-12 px-6 shadow-[0_0_20px_hsl(var(--primary)/0.35)]"
            >
              <Plus className="w-4 h-4" />
              Add Liquidity
            </Button>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Pools</p>
              <p className="text-2xl font-black text-foreground mt-1">{pools.length}</p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Total TVL</p>
              <p className="text-2xl font-black text-primary mt-1">
                ${(
                  pools.reduce((sum, pool) => sum + pool.tvl, 0) / 1_000_000
                ).toFixed(0)}M
              </p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Avg APY</p>
              <p className="text-2xl font-black text-success mt-1">
                {(
                  pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length
                ).toFixed(1)}%
              </p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">My Active Position</p>
              <p className="text-2xl font-black text-accent mt-1">1</p>
            </Card>
          </section>

          {showAddForm && (
            <Card className="glass-panel rounded-3xl border-primary/25 p-6 mb-12 shadow-[0_0_36px_hsl(var(--primary)/0.12)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Add Liquidity</h2>
                  <p className="text-sm text-muted-foreground">
                    Deposit Token A and Token B into the pool.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl border-primary/30" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>

              {message && (
                <p
                  className={`text-sm mb-4 ${
                    status === "error" ? "text-destructive" : "text-success"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Token A
                  </label>
                  <div className="mt-2 mb-2">
                    <TokenSelector
                      onSelect={handleSelectTokenA}
                      selectedToken={selectedTokenA}
                      tokens={LIQUIDITY_TOKENS}
                    />
                  </div>
                  <input
                    type="number"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-primary/25 bg-secondary/30 text-foreground"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Token B
                  </label>
                  <div className="mt-2 mb-2">
                    <TokenSelector
                      onSelect={handleSelectTokenB}
                      selectedToken={selectedTokenB}
                      tokens={LIQUIDITY_TOKENS}
                    />
                  </div>
                  <input
                    type="number"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-primary/25 bg-secondary/30 text-foreground"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Execution: {selectedTokenA.address === TOKEN_A_ADDRESS && selectedTokenB.address === TOKEN_B_ADDRESS ? "On-chain pool" : "Quoted route"}
              </p>

              <Button
                onClick={addLiquidity}
                disabled={status === "pending"}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground font-semibold"
              >
                {status === "pending" ? "Adding liquidity..." : "Add Liquidity"}
              </Button>
            </Card>
          )}

          {/* On-Chain Pool Stats */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-foreground mb-6">On-Chain Pool Statistics (TKA/TKB)</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="glass-panel rounded-2xl border-primary/25 p-5">
                <p className="text-xs text-muted-foreground mb-2">Current Reserves</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-primary">Token A: Loading...</p>
                  <p className="text-lg font-bold text-accent">Token B: Loading...</p>
                </div>
              </Card>
              
              <Card className="glass-panel rounded-2xl border-primary/25 p-5">
                <p className="text-xs text-muted-foreground mb-2">Pool Price</p>
                <p className="text-2xl font-black text-foreground">1 TKA ≈ 1.00 TKB</p>
                <p className="text-xs text-muted-foreground mt-2">Balanced AMM pricing</p>
              </Card>
              
              <Card className="glass-panel rounded-2xl border-primary/25 p-5">
                <p className="text-xs text-muted-foreground mb-2">Trading Fee</p>
                <p className="text-2xl font-black text-success">0.30%</p>
                <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
              </Card>
            </div>
          </section>

          {/* My Positions */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-foreground mb-6">My Positions</h2>

            <Card className="glass-panel rounded-3xl border-primary/25 p-8 text-center">
              <div className="text-4xl mb-4">💧</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You have 1 active position
              </h3>
              <p className="text-muted-foreground mb-6">
                TKA/TKB pool earning 24.5% APY
              </p>

              <Card className="bg-card/70 border-primary/25 p-6 rounded-2xl mb-6 text-left">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Liquidity Provided
                    </p>
                    <p className="text-2xl font-black text-primary">$5,000.00</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      2,500 TKA + 2,500 TKB
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Fees Earned (30d)
                    </p>
                    <p className="text-2xl font-black text-success">
                      $1,250.75
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      2.5% of your position
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/25">
                  <p className="text-sm text-foreground font-semibold mb-2">
                    Current APY: 24.5%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Projected annual earnings: $12,250
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={openManagePosition}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground"
                  >
                    Manage Position
                  </Button>
                  <Button
                    onClick={openWithdrawPosition}
                    variant="outline"
                    className="flex-1 rounded-xl border-primary/30"
                  >
                    Withdraw
                  </Button>
                </div>
              </Card>
            </Card>
          </section>

          {/* My Positions */}
          <section className="mb-16">
            <h2 className="text-2xl font-black text-foreground mb-6">My Positions</h2>

            <Card className="glass-panel rounded-3xl border-primary/25 p-8 text-center">
              <div className="text-4xl mb-4">💧</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You have 1 active position
              </h3>
              <p className="text-muted-foreground mb-6">
                TKA/TKB pool earning 24.5% APY
              </p>

              <Card className="bg-card/70 border-primary/25 p-6 rounded-2xl mb-6 text-left">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Liquidity Provided
                    </p>
                    <p className="text-2xl font-black text-primary">$5,000.00</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      2,500 TKA + 2,500 TKB
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Fees Earned (30d)
                    </p>
                    <p className="text-2xl font-black text-success">
                      $1,250.75
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      2.5% of your position
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/25">
                  <p className="text-sm text-foreground font-semibold mb-2">
                    Current APY: 24.5%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Projected annual earnings: $12,250
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={openManagePosition}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground"
                  >
                    Manage Position
                  </Button>
                  <Button
                    onClick={openWithdrawPosition}
                    variant="outline"
                    className="flex-1 rounded-xl border-primary/30"
                  >
                    Withdraw
                  </Button>
                </div>
              </Card>
            </Card>
          </section>

          {showWithdrawForm && (
            <Card className="glass-panel rounded-3xl border-primary/25 p-6 mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Withdraw Liquidity</h2>
                  <p className="text-sm text-muted-foreground">
                    Remove token amounts from your selected pool position.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl border-primary/30" onClick={() => setShowWithdrawForm(false)}>
                  Cancel
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Token A</label>
                  <div className="mt-2 mb-2">
                    <TokenSelector
                      onSelect={handleSelectTokenA}
                      selectedToken={selectedTokenA}
                      tokens={LIQUIDITY_TOKENS}
                    />
                  </div>
                  <input
                    type="number"
                    value={withdrawAmountA}
                    onChange={(e) => setWithdrawAmountA(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-primary/25 bg-secondary/30 text-foreground"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Token B</label>
                  <div className="mt-2 mb-2">
                    <TokenSelector
                      onSelect={handleSelectTokenB}
                      selectedToken={selectedTokenB}
                      tokens={LIQUIDITY_TOKENS}
                    />
                  </div>
                  <input
                    type="number"
                    value={withdrawAmountB}
                    onChange={(e) => setWithdrawAmountB(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-primary/25 bg-secondary/30 text-foreground"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Execution: {selectedTokenA.address === TOKEN_A_ADDRESS && selectedTokenB.address === TOKEN_B_ADDRESS ? "On-chain pool" : "Quoted route"}
              </p>

              <Button
                onClick={withdrawLiquidity}
                disabled={status === "pending"}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground font-semibold"
              >
                {status === "pending" ? "Withdrawing..." : "Withdraw Liquidity"}
              </Button>
            </Card>
          )}

          {/* All Pools */}
          <section>
            <h2 className="text-2xl font-black text-foreground mb-6">All Pools</h2>

            <div className="grid gap-6">
              {pools.map((pool) => (
                <Card
                  key={pool.id}
                  className="glass-panel rounded-2xl border-primary/25 p-6 hover:border-primary/45 transition-all duration-300"
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6">
                    {/* Pair */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Pair</p>
                      <p className="text-lg font-bold text-foreground">
                        {pool.pair}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary font-semibold">
                          {pool.fee}%
                        </span>
                      </div>
                    </div>

                    {/* TVL */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">TVL</p>
                      <p className="text-lg font-bold text-foreground">
                        ${(pool.tvl / 1000000).toFixed(0)}M
                      </p>
                    </div>

                    {/* 24h Volume */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        24h Volume
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        ${(pool.volume24h / 1000000).toFixed(0)}M
                      </p>
                    </div>

                    {/* APY */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">APY</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-success">
                          {pool.apy}%
                        </p>
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                    </div>

                    {/* My Liquidity */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        My Liquidity
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {pool.myLiquidity > 0
                          ? `$${pool.myLiquidity.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-end">
                      {pool.myLiquidity > 0 ? (
                        <Button
                          onClick={openManagePosition}
                          variant="outline"
                          className="w-full rounded-xl border-primary/30"
                        >
                          Manage
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setMessage(null);
                            setShowWithdrawForm(false);
                            setShowAddForm(true);
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-primary-foreground"
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Info Section */}
          <section className="mt-16 pt-16 border-t border-primary/10">
            <h2 className="text-2xl font-black text-foreground mb-8">
              How Liquidity Pools Work
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-2xl border border-primary/25">
                <div className="mb-4 inline-flex h-10 w-10 rounded-xl bg-primary/20 items-center justify-center">
                  <Droplets className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Provide Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit equal values of both tokens in a pair to become a liquidity provider.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-primary/25">
                <div className="mb-4 inline-flex h-10 w-10 rounded-xl bg-accent/20 items-center justify-center">
                  <Gauge className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Earn Fees</h3>
                <p className="text-sm text-muted-foreground">
                  Earn a percentage of all trading fees when traders use your pool.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-primary/25">
                <div className="mb-4 inline-flex h-10 w-10 rounded-xl bg-success/20 items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Withdraw Anytime</h3>
                <p className="text-sm text-muted-foreground">
                  Withdraw your liquidity plus earned fees at any time, no lockup period.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

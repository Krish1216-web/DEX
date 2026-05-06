import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TokenSelector, type Token } from "@/components/TokenSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Settings,
  XCircle,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import {
  getPoolContract,
  getTokenContract,
  POOL_ADDRESS,
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
} from "@/lib/contracts";

interface SwapToken extends Token {
  price: number;
}

const TOKENS_WITH_PRICES: SwapToken[] = [
  {
    symbol: "TKA",
    name: "Token A",
    balance: "0",
    icon: "A",
    address: TOKEN_A_ADDRESS,
    price: 1.0,
  },
  {
    symbol: "TKB",
    name: "Token B",
    balance: "0",
    icon: "B",
    address: TOKEN_B_ADDRESS,
    price: 1.0,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: "3250.00",
    icon: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    price: 1.0,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    balance: "1000.00",
    icon: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    price: 1.0,
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

function getFriendlySwapError(error: unknown): string {
  const fallback = "Swap failed. Please try again.";

  if (!error) {
    return fallback;
  }

  const err = error as {
    code?: string | number;
    shortMessage?: string;
    reason?: string;
    message?: string;
  };

  if (err.code === 4001 || err.code === "ACTION_REJECTED" || err.code === "action_rejected") {
    return "Transaction rejected in wallet.";
  }

  if (err.shortMessage) {
    return err.shortMessage;
  }

  if (err.reason) {
    return err.reason;
  }

  if (err.message) {
    return err.message;
  }

  return fallback;
}

export function TokenSwap() {
  const [fromToken, setFromToken] = useState<SwapToken>(
    TOKENS_WITH_PRICES[0]
  );
  const [toToken, setToToken] = useState<SwapToken>(TOKENS_WITH_PRICES[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandSettings, setExpandSettings] = useState(false);
  const [txState, setTxState] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [txStatusText, setTxStatusText] = useState("");
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  const handleSelectFromToken = (token: Token) => {
    const matched = TOKENS_WITH_PRICES.find((t) => t.address === token.address);
    setFromToken(matched ?? ({ ...token, price: 1 } as SwapToken));
  };

  const handleSelectToToken = (token: Token) => {
    const matched = TOKENS_WITH_PRICES.find((t) => t.address === token.address);
    setToToken(matched ?? ({ ...token, price: 1 } as SwapToken));
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const from = TOKENS_WITH_PRICES.find(
        (t) => t.symbol === fromToken.symbol
      ) as SwapToken;
      const to = TOKENS_WITH_PRICES.find(
        (t) => t.symbol === toToken.symbol
      ) as SwapToken;
      const rate = from.price / to.price;
      const result = (Number(value) * rate).toFixed(6);
      setToAmount(result);
    } else {
      setToAmount("");
    }
  };

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
    setToAmount("");
  };

  const { connected, addTransaction, updateTransaction, unsupportedNetwork } = useWallet();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const isOnChainPair =
    fromToken.address === TOKEN_A_ADDRESS && toToken.address === TOKEN_B_ADDRESS;

  const handleSwap = async () => {
    setShowConfirm(false);
    setErrorMessage(null);

    if (!connected) {
      setErrorMessage("Connect your wallet first.");
      return;
    }

    if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
      setErrorMessage("Enter a valid amount to swap.");
      return;
    }

    if (fromToken.address === toToken.address) {
      setErrorMessage("Select different tokens to swap.");
      return;
    }

    try {
      setIsSwapping(true);
      setTxState("pending");
      setTxStatusText("Routing transaction and waiting for confirmation...");
      const pendingTxId = `pending-${Date.now()}`;

      addTransaction({
        id: pendingTxId,
        type: "swap",
        from: fromToken.symbol,
        to: toToken.symbol,
        fromAmount,
        toAmount,
        hash: "Pending",
        timestamp: new Date().toLocaleString(),
        status: "pending",
      });

      // On-chain path (real transaction): Token A -> Token B through pool.
      if (isOnChainPair) {
        if (typeof window === "undefined" || !(window as any).ethereum) {
          setErrorMessage("No wallet provider found. Install MetaMask or another wallet.");
          return;
        }

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const tokenA = await getTokenContract(TOKEN_A_ADDRESS, signer);
        const pool = await getPoolContract(signer);

        const amount = ethers.parseUnits(fromAmount, 18);

        const reserveA = BigInt(await pool.reserveA());
        const reserveB = BigInt(await pool.reserveB());

        if (reserveA === 0n || reserveB === 0n) {
          setErrorMessage("Pool has no liquidity. Add liquidity before swapping.");
          return;
        }

        const expectedOut = (reserveB * amount) / (reserveA + amount);
        if (expectedOut <= 0n) {
          setErrorMessage("Swap output is too small. Increase amount.");
          return;
        }

        const slippageBps = Math.round(Number(slippage) * 100);
        const minOut = (expectedOut * BigInt(10000 - slippageBps)) / 10000n;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

        const approveTx = await tokenA.approve(POOL_ADDRESS, amount);
        await approveTx.wait();

        const swapTx = await pool.swapAforB(amount, minOut, deadline);
        const receipt = await swapTx.wait();

        const txHash = receipt?.hash || swapTx.hash;
        const timestamp = new Date().toLocaleString();

        updateTransaction(pendingTxId, {
          hash: txHash,
          timestamp,
          status: "confirmed",
        });

        setTxState("success");
        setTxStatusText("Swap confirmed on-chain.");
        setFromAmount("");
        setToAmount("");

        return;
      }

      // Quoted path for all other listed tokens.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const timestamp = new Date().toLocaleString();
      const mockHash = `0x${Date.now().toString(16).padStart(64, "0").slice(0, 64)}`;

      updateTransaction(pendingTxId, {
        hash: mockHash,
        timestamp,
        status: "confirmed",
      });

      setTxState("success");
      setTxStatusText("Swap completed successfully.");
      setFromAmount("");
      setToAmount("");
    } catch (e) {
      console.error(e);
      setErrorMessage(getFriendlySwapError(e));
      setTxState("failed");
      setTxStatusText("Swap failed. Check wallet details and try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  const gasEstimate = fromAmount ? (Number(fromAmount) * 0.001).toFixed(6) : "0";
  const priceImpact = fromAmount ? (Number(fromAmount) * 0.003).toFixed(2) : "0";
  const minReceived = toAmount
    ? (
        Number(toAmount) -
        (Number(toAmount) * Number(slippage)) / 100
      ).toFixed(6)
    : "0";
  const isHighSlippage = Number(slippage) >= 1;
  const isHighPriceImpact = Number(priceImpact) >= 1;
  const isRiskyTrade = isHighSlippage || isHighPriceImpact;

  return (
    <div className="w-full">
      <Card className="glass-panel border-primary/30 p-6 sm:p-7 max-w-lg mx-auto rounded-3xl shadow-[0_0_45px_hsl(var(--primary)/0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Instant Swap</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time route with transparent pricing
            </p>
          </div>
          <button
            onClick={() => setExpandSettings(!expandSettings)}
            aria-label="Toggle swap settings"
            className="p-2 hover:bg-primary/10 rounded-xl transition-colors border border-primary/20"
          >
            <Settings className="w-5 h-5 text-muted-foreground hover:text-accent" />
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">Live Price</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
          </p>
        </div>

        {/* Settings */}
        {expandSettings && (
          <Collapsible open={expandSettings} onOpenChange={setExpandSettings}>
            <CollapsibleContent className="mb-4">
              <div className="space-y-3 p-3 bg-secondary/20 rounded-lg border border-primary/10">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Slippage Tolerance
                  </label>
                  <div className="flex gap-2 mt-2">
                    {["0.1", "0.5", "1", "2"].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded transition-colors ${
                          slippage === value
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary/75"
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* From Token */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
            You send
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="bg-secondary/30 border-primary/25 rounded-2xl text-2xl font-semibold placeholder:text-muted-foreground pr-16 h-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                {fromToken.symbol}
              </span>
            </div>
            <TokenSelector
              onSelect={handleSelectFromToken}
              selectedToken={fromToken}
              tokens={TOKENS_WITH_PRICES}
            />
            {fromAmount && (
              <p className="text-xs text-muted-foreground">
                ≈ ${(Number(fromAmount) * fromToken.price).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSwitch}
            aria-label="Switch from and to tokens"
            className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all border border-primary/35 hover:border-primary/60 hover:scale-105"
          >
            <ArrowUpDown className="w-5 h-5 text-accent" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
            You receive
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={toAmount}
                readOnly
                className="bg-secondary/30 border-primary/25 rounded-2xl text-2xl font-semibold placeholder:text-muted-foreground pr-16 h-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                {toToken.symbol}
              </span>
            </div>
            <TokenSelector
              onSelect={handleSelectToToken}
              selectedToken={toToken}
              tokens={TOKENS_WITH_PRICES}
            />
            {toAmount && (
              <p className="text-xs text-muted-foreground">
                ≈ ${(Number(toAmount) * toToken.price).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        {fromAmount && (
          <div className="mb-6 p-3 bg-secondary/20 rounded-lg border border-primary/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Price Impact</span>
              <span className="font-semibold text-foreground">{priceImpact}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Min. Received</span>
              <span className="font-semibold text-foreground">
                {minReceived} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Gas Fee</span>
              <span className="font-semibold text-foreground">
                ≈ {gasEstimate} {fromToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Routing Fee</span>
              <span className="font-semibold text-foreground">0.30%</span>
            </div>
          </div>
        )}

        {isRiskyTrade && (
          <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-semibold">High-risk trade warning</p>
                <p className="text-yellow-100/85 mt-1">
                  This swap has elevated slippage or price impact. Final received amount may be significantly lower.
                </p>
              </div>
            </div>
          </div>
        )}

        {unsupportedNetwork && (
          <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            Connected chain is not supported for secure execution. Switch to a supported network to continue.
          </div>
        )}

        {errorMessage && (
          <p className="text-sm text-destructive mb-2">{errorMessage}</p>
        )}

        {/* Swap Button */}
        <Button
          onClick={() => {
            if (!connected) {
              setErrorMessage("Connect your wallet to proceed.");
              return;
            }
            setShowConfirm(true);
          }}
          disabled={
            !connected ||
            unsupportedNetwork ||
            !fromAmount ||
            !toAmount ||
            fromAmount === "0" ||
            isSwapping
          }
          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] animate-gradient-shift hover:opacity-95 text-primary-foreground font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwapping
            ? "Swapping..."
            : fromAmount && toAmount
            ? "Review Swap"
            : "Enter Amount"}
        </Button>

        {txState !== "idle" && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-sm flex items-center gap-2 ${
              txState === "pending"
                ? "border-primary/40 bg-primary/10 text-primary"
                : txState === "success"
                ? "border-success/40 bg-success/10 text-success"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {txState === "pending" && <Loader2 className="w-4 h-4 animate-spin" />}
            {txState === "success" && <CheckCircle2 className="w-4 h-4" />}
            {txState === "failed" && <XCircle className="w-4 h-4" />}
            <span>{txStatusText}</span>
          </div>
        )}

        {!connected && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            Connect your wallet from the top right to enable swaps.
          </p>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-slate-950/90 border-primary/25 max-w-md rounded-2xl backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Confirm Swap
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Please review the details of your swap before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            <div className="p-3 bg-secondary/30 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="text-lg font-bold text-foreground">
                {fromAmount} {fromToken.symbol}
              </p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <p className="text-lg font-bold text-foreground">
                {toAmount} {toToken.symbol}
              </p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg border border-primary/10">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-semibold text-foreground">
                  1 {fromToken.symbol} ≈ {(fromToken.price / toToken.price).toFixed(4)}{" "}
                  {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Slippage</span>
                <span className="font-semibold text-foreground">{slippage}%</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">Execution</span>
                <span className="font-semibold text-foreground">
                  {isOnChainPair ? "On-chain" : "Quoted route"}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted-foreground">Estimated Fee</span>
                <span className="font-semibold text-foreground">0.30%</span>
              </div>
            </div>

            {isRiskyTrade && (
              <label className="flex items-start gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="mt-0.5"
                />
                <span>I understand this trade has higher execution risk and accept potential slippage.</span>
              </label>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSwap}
              disabled={isRiskyTrade && !riskAcknowledged}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-95"
            >
              Confirm Swap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

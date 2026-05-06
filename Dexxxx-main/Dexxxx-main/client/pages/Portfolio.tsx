import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Send, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@/context/WalletContext";
import { useRealtimeData } from "@/hooks/useRealtimeData";

export default function Portfolio() {
  const [showBalance, setShowBalance] = useState(true);
  const { transactions } = useWallet();

  const portfolio = {
    totalValue: 15250.5,
    totalChange: 1250.5,
    percentChange: 8.9,
    balance: 2.5,
  };

  const holdings = [
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 2.5,
      value: 6126.25,
      change: 12.5,
      color: "from-purple-500/20 to-indigo-500/20",
      icon: "Ξ",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      amount: 5000.5,
      value: 5000.5,
      change: 0,
      color: "from-blue-500/20 to-cyan-500/20",
      icon: "USDC",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      amount: 3250.0,
      value: 3250.0,
      change: 0,
      color: "from-green-500/20 to-emerald-500/20",
      icon: "USDT",
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      amount: 150.25,
      value: 1265.11,
      change: -2.3,
      color: "from-pink-500/20 to-rose-500/20",
      icon: "UNI",
    },
  ];

  const [selectedSymbol, setSelectedSymbol] = useState(holdings[0].symbol);

  const formatTimeAgo = (timestamp: string) => {
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return timestamp;

    const diffMs = Date.now() - parsed.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const recentTrades = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "swap")
        .slice(0, 5)
        .map((tx) => {
          const toAmount = Number(tx.toAmount);
          const fromAmount = Number(tx.fromAmount);
          const parsedAmount = Number.isFinite(toAmount) && toAmount > 0 ? toAmount : fromAmount;

          return {
            id: tx.id,
            from: tx.from,
            to: tx.to,
            amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
            value: Number.isFinite(parsedAmount) ? parsedAmount : 0,
            time: formatTimeAgo(tx.timestamp),
          };
        }),
    [transactions]
  );

  const bestPerformer = holdings.reduce((best, current) =>
    current.change > best.change ? current : best
  );

  const totalTradeVolume = recentTrades.reduce((sum, trade) => sum + trade.value, 0);
  const selectedHolding = holdings.find((h) => h.symbol === selectedSymbol) ?? holdings[0];
  const { currentPrice: selectedLivePrice, priceChange: selectedLiveChange } = useRealtimeData(selectedHolding.symbol);
  const selectedLiveValue = selectedHolding.amount * selectedLivePrice;
  const selectedAllocation = (selectedHolding.value / portfolio.totalValue) * 100;
  const selectedTradesCount = recentTrades.filter(
    (trade) => trade.from === selectedHolding.symbol || trade.to === selectedHolding.symbol
  ).length;

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-[30rem] h-[30rem] bg-cyan-400/10 blur-3xl rounded-full" />
        <div className="absolute top-56 -right-24 w-[26rem] h-[26rem] bg-emerald-400/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-[22rem] h-[22rem] bg-sky-300/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-2">Portfolio Console</p>
              <h1 className="text-4xl md:text-5xl font-black text-foreground">Your Capital, In Motion</h1>
            </div>
            <div className="flex gap-2">
              <Link to="/swap">
                <Button className="h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Trade
                </Button>
              </Link>
              <Button variant="outline" className="h-11 px-4 border-primary/25 hover:bg-secondary/50">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card className="border border-cyan-300/20 bg-gradient-to-br from-slate-900/70 via-slate-900/80 to-slate-800/70 rounded-3xl p-7 md:p-9 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_50%)]" />
            <div className="relative z-10 grid md:grid-cols-3 gap-7 items-end">
              <div className="md:col-span-2">
                <p className="text-sm text-slate-300 mb-2">Net Portfolio Value</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {showBalance ? `$${portfolio.totalValue.toLocaleString()}` : "••••••"}
                  </h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {showBalance ? (
                      <Eye className="w-5 h-5 text-slate-300" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-2xl font-bold text-emerald-400">+${portfolio.totalChange.toFixed(2)}</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +{portfolio.percentChange}%
                  </span>
                  <span className="text-sm text-slate-400">last 24h</span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Best Performer</p>
                  <p className="text-lg font-bold text-white mt-1">{bestPerformer.symbol}</p>
                  <p className="text-sm text-emerald-300">+{bestPerformer.change}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Recent Volume</p>
                  <p className="text-lg font-bold text-white mt-1">${totalTradeVolume.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">{recentTrades.length} trades</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-primary/20 bg-card/70 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-foreground">Asset Allocation</h2>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Live Overview</span>
            </div>

            <div className="space-y-4">
              {holdings.map((holding) => {
                const isPositive = holding.change >= 0;
                const allocation = ((holding.value / portfolio.totalValue) * 100).toFixed(1);
                const isActive = selectedSymbol === holding.symbol;

                return (
                  <Card
                    key={holding.symbol}
                    onClick={() => setSelectedSymbol(holding.symbol)}
                    className={`border-primary/20 bg-gradient-to-br ${holding.color} p-5 transition-all cursor-pointer ${
                      isActive
                        ? "ring-2 ring-cyan-300/60 scale-[1.01]"
                        : "hover:scale-[1.01] hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center font-bold text-sm text-foreground">
                          {holding.icon}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{holding.symbol}</p>
                          <p className="text-xs text-muted-foreground">{holding.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-foreground">${holding.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{allocation}% allocation</p>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${Math.min(Number(allocation), 100)}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{holding.amount.toLocaleString()} {holding.symbol}</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? "+" : ""}{holding.change}%
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card className="border-primary/20 bg-card/70 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-2xl font-black text-foreground mb-2">Quick Stats</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Viewing {selectedHolding.name} ({selectedHolding.symbol})
            </p>
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/15 p-4 bg-primary/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Live Price</p>
                <p className="text-2xl font-black text-foreground mt-1">
                  ${selectedLivePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 p-4 bg-primary/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Live Position Value</p>
                <p className="text-2xl font-black text-foreground mt-1">${selectedLiveValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl border border-primary/15 p-4 bg-primary/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">24h Change</p>
                <p className={`text-2xl font-black mt-1 ${selectedLiveChange >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {selectedLiveChange >= 0 ? "+" : ""}{selectedLiveChange.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 p-4 bg-primary/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio Share</p>
                <p className="text-2xl font-black text-foreground mt-1">{selectedAllocation.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedTradesCount} related trades</p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-foreground">Recent Trades</h2>
            <Link to="/history" className="text-sm font-semibold text-primary hover:underline">
              Open full history
            </Link>
          </div>

          {recentTrades.length === 0 ? (
            <Card className="border-primary/20 bg-card/80 p-8 text-center">
              <p className="font-semibold text-foreground">No trades yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest swaps will appear here automatically.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <Card
                  key={trade.id}
                  className="border-primary/20 bg-card/80 p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center font-bold text-primary">
                        {trade.from}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center font-bold text-accent">
                        {trade.to}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Swap {trade.from} to {trade.to}</p>
                        <p className="text-xs text-muted-foreground">{trade.time}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-foreground">{trade.amount.toLocaleString()} {trade.to}</p>
                      <p className="text-sm text-muted-foreground">≈ ${trade.value.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

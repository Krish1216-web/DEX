import { TokenSwap } from "@/components/TokenSwap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { Clock3, ShieldCheck, TrendingUp, Wifi, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Swap() {
  const { connected, account } = useWallet();

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden pb-20">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none pt-20">
        <div className="absolute top-16 right-1/4 w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 -left-28 w-[24rem] h-[24rem] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-[42%] left-[45%] w-64 h-64 bg-success/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs text-accent font-semibold mb-4">
              <Wifi className="w-3 h-3" />
              Live On-Chain Routing
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              Swap Fast, Trade Smart
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Professional execution with real-time pricing, transparent slippage controls, and instant status updates.
            </p>
          </section>

          <div className="grid xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7">
              <TokenSwap />
            </div>

            <div className="xl:col-span-5 space-y-6">
              <Card className="glass-panel rounded-3xl border-primary/25 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Wallet Status</p>
                    <p className="text-lg font-bold mt-1 text-foreground">
                      {connected ? "Connected" : "Not Connected"}
                    </p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-success animate-pulse" : "bg-destructive"}`} />
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-semibold text-foreground">{account ? `Chain ${account.chainId}` : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-semibold text-accent">{account ? `${account.balance} ETH` : "-"}</span>
                  </div>
                </div>

                {!connected && (
                  <Link to="/wallet" className="block mt-5">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95">
                      Connect Wallet
                    </Button>
                  </Link>
                )}
              </Card>

              <Card className="glass-panel rounded-3xl border-primary/25 p-6">
                <h3 className="font-bold text-foreground mb-4">Trading Confidence</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Fast Settlement</p>
                      <p className="text-xs text-muted-foreground">Routes optimized for speed and reliability.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-xl bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Live Price Feed</p>
                      <p className="text-xs text-muted-foreground">Updated every few seconds for decision clarity.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-xl bg-success/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Non-custodial</p>
                      <p className="text-xs text-muted-foreground">You sign and control every transaction.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <section className="mt-10 grid md:grid-cols-3 gap-4">
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-black text-primary mt-1">$2.4B</p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Active Traders</p>
              <p className="text-2xl font-black text-accent mt-1">15.2K</p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Fee Tier</p>
              <p className="text-2xl font-black text-success mt-1">0.1%</p>
            </Card>
          </section>

          <section className="mt-10">
            <Card className="glass-panel rounded-3xl border-primary/25 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Smart Route Quality
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Route Source</p>
                  <p className="text-sm font-semibold text-foreground mt-1">Pool + Direct Path</p>
                  <p className="text-xs text-success mt-2">Optimal route selected</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Estimated Fill</p>
                  <p className="text-sm font-semibold text-foreground mt-1">99.72%</p>
                  <p className="text-xs text-muted-foreground mt-2">Based on current liquidity</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">MEV Protection</p>
                  <p className="text-sm font-semibold text-foreground mt-1">Enabled</p>
                  <p className="text-xs text-success mt-2">Sandwich risk reduced</p>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-6 grid lg:grid-cols-2 gap-4">
            <Card className="glass-panel rounded-2xl border-primary/25 p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-accent" />
                Execution Guide
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Set your amount and confirm route details.</li>
                <li>2. Keep slippage low on stable pairs.</li>
                <li>3. Confirm in wallet and wait for final status.</li>
              </ul>
            </Card>

            <Card className="glass-panel rounded-2xl border-primary/25 p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Market Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-muted-foreground text-xs">Top Pair</p>
                  <p className="font-semibold text-foreground mt-1">ETH/USDC</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-muted-foreground text-xs">Best Liquidity</p>
                  <p className="font-semibold text-foreground mt-1">USDT/USDC</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-muted-foreground text-xs">Avg Slippage</p>
                  <p className="font-semibold text-foreground mt-1">0.28%</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-muted-foreground text-xs">Avg Confirm</p>
                  <p className="font-semibold text-foreground mt-1">~18s</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

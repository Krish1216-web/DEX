import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  Download,
  Search,
  WalletCards,
  Layers3,
  CircleDollarSign,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";

export default function History() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { transactions } = useWallet();

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !search ||
      tx.from.toLowerCase().includes(search.toLowerCase()) ||
      tx.to.toLowerCase().includes(search.toLowerCase()) ||
      tx.hash.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "swap" && tx.type === "swap") ||
      (filter === "add" && tx.type === "add") ||
      (filter === "remove" && tx.type === "remove");

    return matchesSearch && matchesFilter;
  });

  const getTransactionTitle = (type: string, from: string, to: string) => {
    if (type === "add") {
      return `Add Liquidity ${from}/${to}`;
    }
    if (type === "remove") {
      return `Remove Liquidity ${from}/${to}`;
    }
    return `Swap ${from} -> ${to}`;
  };

  const totalSwaps = transactions.filter((tx) => tx.type === "swap").length;
  const totalVolume =
    transactions.length > 0
      ? transactions.reduce((sum, tx) => {
          const amount = parseFloat(tx.fromAmount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) * 2450
      : 0;

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden pb-20">
      <div className="fixed inset-0 pointer-events-none pt-20">
        <div className="absolute top-36 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-24 left-8 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">Transaction History</h1>
              <p className="text-muted-foreground">
                Full audit trail of swaps and liquidity operations
              </p>
            </div>

            <Button
              variant="outline"
              className="gap-2 border-primary/30 bg-card/60 hover:bg-primary/10 rounded-xl"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Total Swaps</p>
              <p className="text-2xl font-black text-primary mt-1">{totalSwaps}</p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Transaction Volume</p>
              <p className="text-2xl font-black text-accent mt-1">${totalVolume.toFixed(0)}</p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Fees Saved</p>
              <p className="text-2xl font-black text-success mt-1">
                ${(transactions.length * 2.5).toFixed(0)}
              </p>
            </Card>
            <Card className="glass-panel rounded-2xl border-primary/25 p-4">
              <p className="text-xs text-muted-foreground">Records</p>
              <p className="text-2xl font-black text-foreground mt-1">{transactions.length}</p>
            </Card>
          </section>

          <Card className="glass-panel rounded-2xl border-primary/25 p-4 mb-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                <Input
                  placeholder="Search by token or hash..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card/70 border-primary/30 rounded-xl placeholder:text-muted-foreground"
                />
              </div>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-card/70 border-primary/30 rounded-xl">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="swap">Swaps Only</SelectItem>
                  <SelectItem value="add">Add Liquidity</SelectItem>
                  <SelectItem value="remove">Remove Liquidity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <Card
                  key={tx.id}
                  className="glass-panel rounded-2xl border-primary/25 p-5 hover:border-primary/45 transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-bold text-foreground">
                            {getTransactionTitle(tx.type, tx.from, tx.to)}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              tx.status === "confirmed"
                                ? "bg-success/20 text-success"
                                : tx.status === "failed"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {tx.type === "swap" ? "Sent" : "Token A"}
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {parseFloat(tx.fromAmount).toFixed(4)} {tx.from}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              {tx.type === "swap" ? "Received" : "Token B"}
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {parseFloat(tx.toAmount).toFixed(4)} {tx.to}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{tx.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <p className="text-sm font-mono text-accent hover:text-primary transition-colors cursor-pointer">
                          {tx.hash.length > 16
                            ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-6)}`
                            : tx.hash}
                        </p>
                      </div>

                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground hover:text-accent" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="glass-panel rounded-2xl border-primary/25 p-12 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <WalletCards className="w-7 h-7 text-primary" />
                  <Layers3 className="w-7 h-7 text-accent" />
                  <CircleDollarSign className="w-7 h-7 text-success" />
                </div>
                <p className="text-foreground font-semibold mb-2">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  Complete your first swap or liquidity action to populate history.
                </p>
              </Card>
            )}
          </div>

          <section className="mt-16 pt-16 border-t border-primary/10">
            <h2 className="text-2xl font-black text-foreground mb-8">Your Stats</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-panel rounded-2xl border-primary/25 p-6">
                <p className="text-xs text-muted-foreground mb-2">Total Swaps</p>
                <p className="text-3xl font-black text-primary">{totalSwaps}</p>
              </Card>

              <Card className="glass-panel rounded-2xl border-primary/25 p-6">
                <p className="text-xs text-muted-foreground mb-2">Total Volume</p>
                <p className="text-3xl font-black text-accent">${totalVolume.toFixed(0)}</p>
              </Card>

              <Card className="glass-panel rounded-2xl border-primary/25 p-6">
                <p className="text-xs text-muted-foreground mb-2">Fees Saved</p>
                <p className="text-3xl font-black text-success">
                  ${(transactions.length * 2.5).toFixed(0)}
                </p>
              </Card>

              <Card className="glass-panel rounded-2xl border-primary/25 p-6">
                <p className="text-xs text-muted-foreground mb-2">Member Since</p>
                <p className="text-3xl font-black text-foreground">30d</p>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Lock, RefreshCw, Search } from "lucide-react";

interface AdminTransaction {
  id: string;
  walletAddress: string;
  type: "swap" | "add" | "remove";
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  hash: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

export default function Admin() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const authHeaders = password
    ? {
        "x-admin-password": password,
      }
    : undefined;

  const verifyPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid admin password");
      }

      setAuthorized(true);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || "Unable to verify admin password.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "200" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
        headers: authHeaders,
      });
      if (!response.ok) {
        if (response.status === 401) {
          setAuthorized(false);
          throw new Error("Admin session expired. Please enter password again.");
        }
        throw new Error("Failed to fetch transactions from database");
      }

      const json = (await response.json()) as { transactions: AdminTransaction[] };
      setTransactions(Array.isArray(json.transactions) ? json.transactions : []);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authorized) return;
    void fetchTransactions();
  }, [authorized, statusFilter, typeFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((tx) =>
      tx.walletAddress.toLowerCase().includes(q) ||
      tx.hash.toLowerCase().includes(q) ||
      tx.from.toLowerCase().includes(q) ||
      tx.to.toLowerCase().includes(q),
    );
  }, [transactions, search]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!authorized ? (
          <Card className="glass-panel rounded-2xl border-primary/25 p-8 max-w-lg mx-auto mt-16">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Admin Access</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter admin password to access database records.
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-card/70 border-primary/30 rounded-xl mb-4"
            />
            <Button
              onClick={() => void verifyPassword()}
              disabled={!password || loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              {loading ? "Verifying..." : "Unlock Admin"}
            </Button>
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
            <p className="text-xs text-muted-foreground mt-3">
              Default password: fluxdex-admin. Set ADMIN_PASSWORD in your environment to change it.
            </p>
          </Card>
        ) : (
          <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground">Admin Database Viewer</h1>
            <p className="text-muted-foreground mt-2">Live transaction records from SQLite.</p>
          </div>

          <Button
            onClick={() => void fetchTransactions()}
            className="rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            className="border-primary/30"
            onClick={() => {
              setAuthorized(false);
              setPassword("");
            }}
          >
            Lock Admin
          </Button>
        </div>

        <Card className="glass-panel rounded-2xl border-primary/25 p-4 mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wallet/hash/token"
                className="pl-10 bg-card/70 border-primary/30 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-card/70 border-primary/30 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-card/70 border-primary/30 rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
                <SelectItem value="add">Add Liquidity</SelectItem>
                <SelectItem value="remove">Remove Liquidity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="glass-panel rounded-2xl border-primary/25 p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Rows</p>
              <p className="text-2xl font-black">{filtered.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-black text-success">
                {filtered.filter((t) => t.status === "confirmed").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-black text-primary">
                {filtered.filter((t) => t.status === "pending").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-2xl font-black text-destructive">
                {filtered.filter((t) => t.status === "failed").length}
              </p>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="rounded-xl border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-6">
            {error}
          </Card>
        )}

        {filtered.length === 0 ? (
          <Card className="glass-panel rounded-2xl border-primary/25 p-12 text-center">
            <Database className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-semibold text-foreground">No records found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different filter or perform a new swap.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <Card key={tx.id} className="glass-panel rounded-xl border-primary/25 p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet</p>
                    <p className="font-mono">{tx.walletAddress.slice(0, 8)}...{tx.walletAddress.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-semibold uppercase">{tx.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pair</p>
                    <p className="font-semibold">{tx.from} to {tx.to}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amounts</p>
                    <p>{tx.fromAmount} / {tx.toAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className={tx.status === "confirmed" ? "text-success font-semibold" : tx.status === "failed" ? "text-destructive font-semibold" : "text-primary font-semibold"}>
                      {tx.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hash</p>
                    <p className="font-mono">{tx.hash.length > 16 ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}` : tx.hash}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{tx.timestamp}</p>
              </Card>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

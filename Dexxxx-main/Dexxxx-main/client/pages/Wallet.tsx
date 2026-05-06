import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@/context/WalletContext";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  supported: boolean;
}

export default function Wallet() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wallets: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      description: "The #1 Web3 wallet. Easy and secure.",
      color: "from-orange-500/20 to-yellow-500/20",
      supported: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect any wallet via QR code.",
      color: "from-blue-500/20 to-cyan-500/20",
      supported: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "₿",
      description: "Earn and trade with Coinbase.",
      color: "from-blue-600/20 to-blue-500/20",
      supported: true,
    },
    {
      id: "ledger",
      name: "Ledger Live",
      icon: "🔐",
      description: "Hardware wallet security.",
      color: "from-green-500/20 to-emerald-500/20",
      supported: true,
    },
    {
      id: "trezor",
      name: "Trezor",
      icon: "T",
      description: "Hardware wallet for crypto.",
      color: "from-gray-500/20 to-slate-500/20",
      supported: false,
    },
    {
      id: "brave",
      name: "Brave Wallet",
      icon: "⚔️",
      description: "Built-in Web3 wallet.",
      color: "from-red-500/20 to-pink-500/20",
      supported: true,
    },
  ];

  const { connected, connect } = useWallet();

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setConnecting(true);
    setConnectionError(null);

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No Ethereum provider found. Install MetaMask or another wallet.");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      connect({
        address,
        balance: Number(ethers.formatEther(balance)).toFixed(4),
        chainId: Number(network.chainId),
      });

      setRedirecting(true);
      setTimeout(() => {
        window.location.href = "/portfolio";
      }, 2000);
    } catch (err) {
      console.error(err);
      setConnecting(false);
      const e = err as { code?: string | number; shortMessage?: string; message?: string };

      if (e.code === 4001 || e.code === "ACTION_REJECTED" || e.code === "action_rejected") {
        setConnectionError("Wallet connection was rejected.");
        return;
      }

      setConnectionError(e.shortMessage || e.message || "Failed to connect wallet.");
    }
  };

  if (connected || redirecting) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Connected!</h2>
          <p className="text-muted-foreground">Redirecting to your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none pt-20">
        <div className="absolute top-40 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10">
        {/* Back button */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link to="/">
            <Button variant="ghost" className="gap-2 hover:bg-secondary/50">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your preferred wallet to start trading. Your keys, your coins, your control.
          </p>
        </div>

        {/* Wallet Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {connectionError && (
            <Card className="mb-6 border-destructive/40 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{connectionError}</p>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => !connecting && wallet.supported && handleConnect(wallet.id)}
                disabled={!wallet.supported || connecting}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${
                    selectedWallet === wallet.id
                      ? "border-primary bg-primary/10"
                      : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  }
                  ${!wallet.supported ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${wallet.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="text-4xl mb-4">{wallet.icon}</div>

                  {/* Name and description */}
                  <h3 className="text-lg font-bold text-foreground mb-2 text-left">
                    {wallet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-left mb-4">
                    {wallet.description}
                  </p>

                  {/* Status */}
                  {!wallet.supported ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      Coming Soon
                    </div>
                  ) : selectedWallet === wallet.id && connecting ? (
                    <div className="text-sm text-primary font-semibold">
                      Connecting...
                    </div>
                  ) : selectedWallet === wallet.id ? (
                    <div className="flex items-center gap-2 text-success text-sm font-semibold">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  ) : (
                    <div className="text-sm text-accent font-semibold group-hover:translate-x-1 transition-transform inline-block">
                      Connect →
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-primary/10">
          <h2 className="text-2xl font-bold text-foreground mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Select Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Choose your wallet provider from the options above.
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Approve Connection</h3>
              <p className="text-sm text-muted-foreground">
                Sign the message to verify you own the wallet.
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Start Trading</h3>
              <p className="text-sm text-muted-foreground">
                You're ready to trade instantly on FluxDEX.
              </p>
            </div>
          </div>
        </section>

        {/* Security Info */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border border-success/30 p-8">
            <div className="flex gap-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Your security is our priority</h3>
                <p className="text-sm text-muted-foreground">
                  We never store your private keys or wallet data. Every transaction is verified on the blockchain. Your wallet provider handles all authentication.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

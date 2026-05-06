import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Wifi, CircleCheck, AlertCircle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

const CHAIN_LABELS: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia",
  31337: "Hardhat Local",
};

export function WalletConnect() {
  const {
    connected,
    account,
    connect,
    disconnect,
    unsupportedNetwork,
    supportedChainIds,
    switchToSupportedNetwork,
  } = useWallet();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const networkLabel = account ? CHAIN_LABELS[account.chainId] || `Chain ${account.chainId}` : "Not connected";

  const handleSwitchNetwork = async () => {
    try {
      setSwitchingNetwork(true);
      setErrorMessage(null);
      await switchToSupportedNetwork(supportedChainIds[0]);
    } catch (error) {
      const err = error as { shortMessage?: string; message?: string };
      setErrorMessage(err.shortMessage || err.message || "Failed to switch network.");
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMessage(null);

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No wallet provider detected. Install MetaMask or another EVM wallet.");
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

      setOpen(false);
    } catch (error) {
      const err = error as { code?: string | number; shortMessage?: string; message?: string };
      if (err.code === 4001 || err.code === "ACTION_REJECTED" || err.code === "action_rejected") {
        setErrorMessage("Connection request was rejected in your wallet.");
      } else {
        setErrorMessage(err.shortMessage || err.message || "Failed to connect wallet.");
      }
    } finally {
      setConnecting(false);
    }
  };

  if (!connected) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-primary/40 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-primary/30 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_42px_rgba(32,124,255,0.2)]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Securely connect your wallet to start swapping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {[
                { label: "MetaMask", icon: "MM" },
                { label: "WalletConnect", icon: "WC" },
                { label: "Coinbase Wallet", icon: "CB" },
              ].map((option) => (
                <Card
                  key={option.label}
                  className="flex items-center justify-between rounded-xl border border-primary/25 bg-card/70 px-4 py-3 hover:border-primary/45 hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/50 to-accent/35 text-xs font-bold flex items-center justify-center">
                      {option.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">EVM compatible</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    size="sm"
                    className="rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {connecting ? "Connecting" : "Use"}
                  </Button>
                </Card>
              ))}
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              By connecting, you remain fully non-custodial. We never access private keys.
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl border-primary/35 bg-card/60 hover:bg-primary/10 transition-all"
        >
          <Wifi className="w-4 h-4 mr-2 text-success" />
          <span className="hidden sm:inline">
            {formatAddress(account?.address || "")}
          </span>
          <span className="sm:hidden">{formatAddress(account?.address || "").slice(0, 4)}...</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-slate-950/90 backdrop-blur-xl border-primary/25">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Connected Wallet</p>
          <p className="text-sm font-mono font-semibold mt-1 text-foreground">
            {formatAddress(account?.address || "")}
          </p>
        </div>
        <DropdownMenuSeparator className="bg-primary/10" />
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-sm font-semibold mt-1 text-accent">
            {account?.balance} ETH
          </p>
        </div>
        <DropdownMenuSeparator className="bg-primary/10" />
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Network</p>
          <div className={`text-sm font-semibold mt-1 flex items-center gap-2 ${unsupportedNetwork ? "text-yellow-400" : "text-success"}`}>
            <CircleCheck className="w-4 h-4" />
            {networkLabel}
          </div>
          {unsupportedNetwork && (
            <Button
              onClick={handleSwitchNetwork}
              disabled={switchingNetwork}
              size="sm"
              className="mt-2 h-8 w-full rounded-lg bg-yellow-500 hover:bg-yellow-500/90 text-black"
            >
              {switchingNetwork ? "Switching..." : "Switch To Supported Network"}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-primary/10" />
        <DropdownMenuItem
          onClick={disconnect}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ethers } from "ethers";
import {
  createTransactionRecord,
  fetchTransactionsForWallet,
  updateTransactionRecord,
} from "@/lib/transactionsApi";

export interface WalletAccount {
  address: string;
  balance: string;
  chainId: number;
}

export interface Transaction {
  id: string;
  type: "swap" | "add" | "remove";
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  hash: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

interface WalletContextType {
  connected: boolean;
  account: WalletAccount | null;
  connect: (account: WalletAccount) => void;
  disconnect: () => void;
  unsupportedNetwork: boolean;
  supportedChainIds: number[];
  switchToSupportedNetwork: (chainId?: number) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);
const SUPPORTED_CHAIN_IDS = [1, 11155111, 31337];
const CHAIN_PARAMS: Record<number, Record<string, unknown>> = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum.publicnode.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  11155111: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-sepolia.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const unsupportedNetwork = !!account && !SUPPORTED_CHAIN_IDS.includes(account.chainId);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const ethereum = (window as any).ethereum;
    const handleChainChanged = (chainHex: string) => {
      const parsedChainId = Number.parseInt(chainHex, 16);
      setAccount((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, chainId: parsedChainId };
        localStorage.setItem("walletAccount", JSON.stringify(updated));
        return updated;
      });
    };

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts?.length) {
        disconnect();
        return;
      }

      if (!ethereum) return;
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(accounts[0]);
      const network = await provider.getNetwork();
      const walletAccount: WalletAccount = {
        address: String(accounts[0]),
        balance: Number(ethers.formatEther(balance)).toFixed(4),
        chainId: Number(network.chainId),
      };
      setConnected(true);
      setAccount(walletAccount);
      localStorage.setItem("walletConnected", "true");
      localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
    };

    const loadFromLocal = async () => {
      try {
        const stored = localStorage.getItem("walletAccount");
        if (stored) {
          const parsed = JSON.parse(stored) as WalletAccount;
          if (parsed?.address) {
            setConnected(true);
            setAccount(parsed);
          }
        }

        // Load transaction history
        const txStored = localStorage.getItem("walletTransactions");
        if (txStored) {
          try {
            const txs = JSON.parse(txStored) as Transaction[];
            setTransactions(txs);
          } catch {
            setTransactions([]);
          }
        }

        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const address = String(accounts[0]);
            const balance = await provider.getBalance(address);
            const network = await provider.getNetwork();
            const walletAccount: WalletAccount = {
              address,
              balance: Number(ethers.formatEther(balance)).toFixed(4),
              chainId: Number(network.chainId),
            };
            setConnected(true);
            setAccount(walletAccount);
            localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
            localStorage.setItem("walletConnected", "true");
          }

          ethereum.on("chainChanged", handleChainChanged);
          ethereum.on("accountsChanged", handleAccountsChanged);
        }
      } catch {
        localStorage.removeItem("walletAccount");
        localStorage.removeItem("walletConnected");
      }
    };

    loadFromLocal();

    return () => {
      if (!ethereum) return;
      ethereum.removeListener("chainChanged", handleChainChanged);
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  React.useEffect(() => {
    const walletAddress = account?.address;
    if (!walletAddress) {
      return;
    }

    let cancelled = false;

    const syncTransactions = async () => {
      try {
        const remoteTransactions = await fetchTransactionsForWallet(walletAddress);
        if (cancelled) {
          return;
        }
        setTransactions(remoteTransactions);
        localStorage.setItem("walletTransactions", JSON.stringify(remoteTransactions));
      } catch {
        // Keep local cache if API is temporarily unavailable.
      }
    };

    syncTransactions();

    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  const connect = (walletAccount: WalletAccount) => {
    setConnected(true);
    setAccount(walletAccount);
    localStorage.setItem("walletConnected", "true");
    localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
  };

  const disconnect = () => {
    setConnected(false);
    setAccount(null);
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAccount");
  };

  const switchToSupportedNetwork = async (chainId = SUPPORTED_CHAIN_IDS[0]) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No wallet provider found.");
    }

    const chainHex = `0x${chainId.toString(16)}`;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (error) {
      const err = error as { code?: number };
      if (err.code === 4902 && CHAIN_PARAMS[chainId]) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CHAIN_PARAMS[chainId]],
        });
      } else {
        throw error;
      }
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      const address = String(accounts[0]);
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      const walletAccount: WalletAccount = {
        address,
        balance: Number(ethers.formatEther(balance)).toFixed(4),
        chainId: Number(network.chainId),
      };
      setAccount(walletAccount);
      localStorage.setItem("walletAccount", JSON.stringify(walletAccount));
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      const updatedTransactions = [transaction, ...prev];
      localStorage.setItem("walletTransactions", JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });

    if (account?.address) {
      void createTransactionRecord(account.address, transaction);
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const updatedTransactions = prev.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      );
      localStorage.setItem("walletTransactions", JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });

    if (account?.address) {
      void updateTransactionRecord(account.address, id, updates);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        account,
        connect,
        disconnect,
        unsupportedNetwork,
        supportedChainIds: SUPPORTED_CHAIN_IDS,
        switchToSupportedNetwork,
        transactions,
        addTransaction,
        updateTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

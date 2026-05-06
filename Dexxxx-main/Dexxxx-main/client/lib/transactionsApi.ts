import type { Transaction } from "@/context/WalletContext";

interface TransactionsResponse {
  transactions: Transaction[];
}

export async function fetchTransactionsForWallet(walletAddress: string): Promise<Transaction[]> {
  const response = await fetch(`/api/transactions?wallet=${encodeURIComponent(walletAddress)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  const json = (await response.json()) as TransactionsResponse;
  return Array.isArray(json.transactions) ? json.transactions : [];
}

export async function createTransactionRecord(walletAddress: string, transaction: Transaction) {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...transaction, walletAddress }),
  });

  if (!response.ok) {
    throw new Error("Failed to create transaction");
  }
}

export async function updateTransactionRecord(
  walletAddress: string,
  id: string,
  updates: Partial<Transaction>,
) {
  const response = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, updates }),
  });

  if (!response.ok) {
    throw new Error("Failed to update transaction");
  }
}

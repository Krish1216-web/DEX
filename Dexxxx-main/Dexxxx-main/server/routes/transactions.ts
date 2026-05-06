import { RequestHandler } from "express";
import { z } from "zod";
import {
  listTransactionsByWallet,
  upsertTransaction,
  updateTransaction,
  type DbTransaction,
} from "../db/sqlite";

const transactionSchema = z.object({
  id: z.string().min(1),
  walletAddress: z.string().min(1),
  type: z.enum(["swap", "add", "remove"]),
  from: z.string().min(1),
  to: z.string().min(1),
  fromAmount: z.string().min(1),
  toAmount: z.string().min(1),
  hash: z.string().min(1),
  timestamp: z.string().min(1),
  status: z.enum(["pending", "confirmed", "failed"]),
});

const transactionUpdateSchema = z.object({
  walletAddress: z.string().min(1),
  updates: z
    .object({
      hash: z.string().min(1).optional(),
      timestamp: z.string().min(1).optional(),
      status: z.enum(["pending", "confirmed", "failed"]).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field in updates is required",
    }),
});

export const handleGetTransactions: RequestHandler = async (req, res) => {
  const walletAddress = String(req.query.wallet || "").trim();

  if (!walletAddress) {
    return res.status(400).json({ error: "wallet query parameter is required" });
  }

  try {
    const transactions = await listTransactionsByWallet(walletAddress);
    return res.status(200).json({ transactions });
  } catch {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const handleCreateTransaction: RequestHandler = async (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid transaction payload" });
  }

  try {
    await upsertTransaction(parsed.data as DbTransaction);
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to store transaction" });
  }
};

export const handleUpdateTransaction: RequestHandler = async (req, res) => {
  const id = String(req.params.id || "").trim();

  if (!id) {
    return res.status(400).json({ error: "Transaction id is required" });
  }

  const parsed = transactionUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid update payload" });
  }

  try {
    await updateTransaction(parsed.data.walletAddress, id, parsed.data.updates);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to update transaction" });
  }
};

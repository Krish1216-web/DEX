import { RequestHandler } from "express";
import { z } from "zod";
import { listRecentTransactions } from "../db/sqlite";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "fluxdex-admin";
}

function isAdminAuthorized(headerValue: string | string[] | undefined) {
  if (!headerValue) return false;
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return value === getAdminPassword();
}

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(500).optional(),
  wallet: z.string().optional(),
  type: z.enum(["swap", "add", "remove"]).optional(),
  status: z.enum(["pending", "confirmed", "failed"]).optional(),
});

export const handleAdminGetTransactions: RequestHandler = async (req, res) => {
  if (!isAdminAuthorized(req.headers["x-admin-password"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const { limit = 100, wallet, type, status } = parsed.data;
    const transactions = await listRecentTransactions({
      limit,
      walletAddress: wallet,
      type,
      status,
    });

    return res.status(200).json({ transactions });
  } catch {
    return res.status(500).json({ error: "Failed to fetch admin transactions" });
  }
};

export const handleAdminVerify: RequestHandler = async (req, res) => {
  if (!isAdminAuthorized(req.headers["x-admin-password"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({ ok: true });
};

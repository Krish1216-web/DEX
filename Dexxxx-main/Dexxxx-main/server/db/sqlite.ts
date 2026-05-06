import fs from "node:fs";
import path from "node:path";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

export interface DbTransaction {
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

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

async function initDatabase() {
  const dataDir = path.resolve(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const db = await open({
    filename: path.join(dataDir, "dex.sqlite"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      type TEXT NOT NULL,
      from_token TEXT NOT NULL,
      to_token TEXT NOT NULL,
      from_amount TEXT NOT NULL,
      to_amount TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      tx_timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_wallet
    ON transactions (wallet_address, created_at DESC);
  `);

  return db;
}

export function getDb() {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  return dbPromise;
}

function mapRow(row: any): DbTransaction {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    type: row.type,
    from: row.from_token,
    to: row.to_token,
    fromAmount: row.from_amount,
    toAmount: row.to_amount,
    hash: row.tx_hash,
    timestamp: row.tx_timestamp,
    status: row.status,
  };
}

export async function listTransactionsByWallet(walletAddress: string): Promise<DbTransaction[]> {
  const db = await getDb();
  const rows = await db.all(
    `SELECT * FROM transactions WHERE wallet_address = ? ORDER BY created_at DESC`,
    walletAddress.toLowerCase(),
  );
  return rows.map(mapRow);
}

export async function listRecentTransactions(options?: {
  limit?: number;
  walletAddress?: string;
  type?: DbTransaction["type"];
  status?: DbTransaction["status"];
}): Promise<DbTransaction[]> {
  const db = await getDb();
  const limit = options?.limit ?? 100;
  const whereClauses: string[] = [];
  const values: string[] = [];

  if (options?.walletAddress) {
    whereClauses.push("wallet_address = ?");
    values.push(options.walletAddress.toLowerCase());
  }

  if (options?.type) {
    whereClauses.push("type = ?");
    values.push(options.type);
  }

  if (options?.status) {
    whereClauses.push("status = ?");
    values.push(options.status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const rows = await db.all(
    `SELECT * FROM transactions ${whereSql} ORDER BY created_at DESC LIMIT ?`,
    ...values,
    String(limit),
  );

  return rows.map(mapRow);
}

export async function upsertTransaction(transaction: DbTransaction): Promise<void> {
  const db = await getDb();
  await db.run(
    `INSERT INTO transactions (
      id, wallet_address, type, from_token, to_token, from_amount, to_amount, tx_hash, tx_timestamp, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      wallet_address = excluded.wallet_address,
      type = excluded.type,
      from_token = excluded.from_token,
      to_token = excluded.to_token,
      from_amount = excluded.from_amount,
      to_amount = excluded.to_amount,
      tx_hash = excluded.tx_hash,
      tx_timestamp = excluded.tx_timestamp,
      status = excluded.status,
      updated_at = unixepoch()`,
    transaction.id,
    transaction.walletAddress.toLowerCase(),
    transaction.type,
    transaction.from,
    transaction.to,
    transaction.fromAmount,
    transaction.toAmount,
    transaction.hash,
    transaction.timestamp,
    transaction.status,
  );
}

export async function updateTransaction(
  walletAddress: string,
  id: string,
  updates: Partial<Pick<DbTransaction, "hash" | "timestamp" | "status">>,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: Array<string> = [];

  if (typeof updates.hash === "string") {
    fields.push("tx_hash = ?");
    values.push(updates.hash);
  }

  if (typeof updates.timestamp === "string") {
    fields.push("tx_timestamp = ?");
    values.push(updates.timestamp);
  }

  if (typeof updates.status === "string") {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) {
    return;
  }

  fields.push("updated_at = unixepoch()");

  await db.run(
    `UPDATE transactions
     SET ${fields.join(", ")}
     WHERE id = ? AND wallet_address = ?`,
    ...values,
    id,
    walletAddress.toLowerCase(),
  );
}

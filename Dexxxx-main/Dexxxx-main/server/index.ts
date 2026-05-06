import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleCreateTransaction,
  handleGetTransactions,
  handleUpdateTransaction,
} from "./routes/transactions";
import { handleAdminGetTransactions, handleAdminVerify } from "./routes/admin";
import { handleLiveMarkets } from "./routes/markets";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/markets/live", handleLiveMarkets);
  app.post("/api/admin/verify", handleAdminVerify);
  app.get("/api/admin/transactions", handleAdminGetTransactions);
  app.get("/api/transactions", handleGetTransactions);
  app.post("/api/transactions", handleCreateTransaction);
  app.patch("/api/transactions/:id", handleUpdateTransaction);

  return app;
}

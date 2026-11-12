import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db/pool.js";
import { authRouter } from "./routes/auth.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(500).json({ status: "error", db: "down" });
  }
});

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

// Unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Any error that reaches here (bad JSON, body too large, unexpected bugs)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;

  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
  res.status(status).json({ error: status === 413 ? "Request too large" : "Invalid request" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on port ${port}`));
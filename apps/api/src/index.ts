import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import { productsRouter } from "./routes/products.js";
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(500).json({ status: "error", db: "down" });
  }
});

app.use("/products", productsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on port ${port}`));

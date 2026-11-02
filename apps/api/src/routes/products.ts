import { Router } from "express";
import { pool } from "../db/pool.js";

export const productsRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /products?q=bag&limit=20&offset=0
productsRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  try {
    const result = await pool.query(
      `select id, slug, name, description, price_cents, image_url, stock
       from products
       where ($1::text = '' or name ilike '%' || $1::text || '%' or description ilike '%' || $1::text || '%')
       order by created_at desc, name
       limit $2 offset $3`,
      [q, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// GET /products/:id
productsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    const result = await pool.query(
      `select id, slug, name, description, price_cents, image_url, stock
       from products where id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load product" });
  }
});
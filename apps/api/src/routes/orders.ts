import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = Router();
ordersRouter.use(requireAuth); // every orders route needs a logged-in user

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The client sends only ids and quantities. Prices are never accepted from the client.
const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product id"),
        quantity: z.number().int("Quantity must be a whole number").min(1).max(99),
      })
    )
    .min(1, "Your cart is empty")
    .max(50, "Too many items in one order"),
});

class OrderError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

// One query returns orders with their items. Optionally filter to a single order.
async function fetchOrders(userId: string, orderId: string | null) {
  const result = await pool.query(
    `select o.id, o.status, o.total_cents, o.created_at,
            coalesce(
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'name', p.name,
                  'quantity', oi.quantity,
                  'unit_price_cents', oi.unit_price_cents
                ) order by p.name
              ) filter (where oi.id is not null),
              '[]'::json
            ) as items
     from orders o
     left join order_items oi on oi.order_id = o.id
     left join products p on p.id = oi.product_id
     where o.user_id = $1 and ($2::uuid is null or o.id = $2::uuid)
     group by o.id
     order by o.created_at desc`,
    [userId, orderId]
  );
  return result.rows;
}

// POST /orders
ordersRouter.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  // Merge duplicate product lines
  const wanted = new Map<string, number>();
  for (const item of parsed.data.items) {
    wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + item.quantity);
  }
  const ids = [...wanted.keys()];
  const userId = req.user!.id;

  const client = await pool.connect();
  try {
    await client.query("begin");

    // Prices and stock come from the database, never from the browser
    const found = await client.query(
      "select id, name, price_cents, stock from products where id = any($1::uuid[])",
      [ids]
    );
    if (found.rowCount !== ids.length) {
      throw new OrderError("Some products in your cart no longer exist", 400);
    }

    let total = 0;
    const productIds: string[] = [];
    const quantities: number[] = [];
    const prices: number[] = [];

    for (const p of found.rows) {
      const qty = wanted.get(p.id)!;
      if (qty > p.stock) {
        throw new OrderError(`Not enough stock for ${p.name} (only ${p.stock} left)`, 409);
      }
      total += p.price_cents * qty;
      productIds.push(p.id);
      quantities.push(qty);
      prices.push(p.price_cents);
    }

    const orderRes = await client.query(
      "insert into orders (user_id, total_cents) values ($1, $2) returning id",
      [userId, total]
    );
    const orderId: string = orderRes.rows[0].id;

    await client.query(
      `insert into order_items (order_id, product_id, quantity, unit_price_cents)
       select $1::uuid, t.product_id, t.quantity, t.price
       from unnest($2::uuid[], $3::int[], $4::int[]) as t(product_id, quantity, price)`,
      [orderId, productIds, quantities, prices]
    );

    await client.query("commit");

    const [order] = await fetchOrders(userId, orderId);
    res.status(201).json(order);
  } catch (err) {
    await client.query("rollback");
    if (err instanceof OrderError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create order" });
  } finally {
    client.release();
  }
});

// GET /orders  (the current user's orders, newest first)
ordersRouter.get("/", async (req, res) => {
  try {
    res.json(await fetchOrders(req.user!.id, null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load orders" });
  }
});

// GET /orders/:id  (404 if it isn't yours, so other users' orders stay hidden)
ordersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    const [order] = await fetchOrders(req.user!.id, id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load order" });
  }
});
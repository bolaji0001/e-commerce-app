import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { signToken } from "../auth/token";

export const authRouter = Router();

const BCRYPT_ROUNDS = 12;
// Used to keep login timing similar when the email doesn't exist
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  // bcrypt only uses the first 72 bytes, so we cap the length
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /auth/register
authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { email, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await pool.query(
      `insert into users (email, password_hash)
       values ($1, $2)
       returning id, email, role`,
      [email, passwordHash]
    );
    const user = result.rows[0];
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    // 23505 = unique violation (email already registered)
    if ((err as { code?: string }).code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create account" });
  }
});

// POST /auth/login
authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      "select id, email, role, password_hash from users where email = $1",
      [email]
    );
    const row = result.rows[0];
    // Always run a comparison so a missing account takes about as long as a wrong password
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = { id: row.id, email: row.email, role: row.role };
    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log in" });
  }
});

// GET /auth/me  (needs a valid token)
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("select id, email, role from users where id = $1", [req.user!.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load account" });
  }
});
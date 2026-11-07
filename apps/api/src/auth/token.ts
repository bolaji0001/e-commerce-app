import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

export type AuthUser = { id: string; role: "customer" | "admin" };

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, secret as string, {
    subject: user.id,
    expiresIn: SEVEN_DAYS_IN_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, secret as string, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub) return null;
    if (payload.role !== "customer" && payload.role !== "admin") return null;
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
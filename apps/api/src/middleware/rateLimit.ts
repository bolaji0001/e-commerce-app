import rateLimit from "express-rate-limit";

// Max 10 failed login attempts per IP every 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

// Max 5 new accounts per IP per hour
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-ups from this address. Please try again later." },
});
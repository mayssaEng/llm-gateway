import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

const WINDOW_MS = 60 * 1000; // fenêtre de 1 minute
const MAX_REQUESTS = 5; // 5 requêtes max par minute par clé (volontairement bas pour bien tester)

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const owner = req.apiKeyOwner;

  if (!owner) {
    // Ne devrait jamais arriver si ce middleware est placé après authenticateApiKey
    return res.status(500).json({ error: "Rate limit middleware used without authentication" });
  }

  const now = Date.now();
  const entry = rateLimitStore.get(owner);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Nouvelle fenêtre de temps : on réinitialise le compteur
    rateLimitStore.set(owner, { count: 1, windowStart: now });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds.toString());
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfterSeconds,
    });
  }

  entry.count += 1;
  next();
}

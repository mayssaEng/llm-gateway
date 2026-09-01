import { Request, Response, NextFunction } from "express";
import { findApiKey } from "../config/apiKeys";

export interface AuthenticatedRequest extends Request {
  apiKeyOwner?: string;
  isAdmin?: boolean;
}

export async function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const key = authHeader.replace("Bearer ", "");

  try {
    const record = await findApiKey(key);

    if (!record) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.apiKeyOwner = record.owner;
    req.isAdmin = record.isAdmin ?? false;
    next();
  } catch (err: any) {
    res.status(500).json({ error: "Authentication error: " + err.message });
  }
}
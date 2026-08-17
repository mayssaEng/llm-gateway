import { Request, Response, NextFunction } from "express";
import { findApiKey } from "../config/apiKeys";

export interface AuthenticatedRequest extends Request {
  apiKeyOwner?: string;
}

export function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const key = authHeader.replace("Bearer ", "");
  const record = findApiKey(key);

  if (!record) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.apiKeyOwner = record.owner;
  next();
}
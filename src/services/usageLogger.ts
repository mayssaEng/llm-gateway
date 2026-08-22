import { getDb } from "../config/database";
import { calculateCost } from "../config/pricing";

export interface UsageLogEntry {
  apiKey: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  fallback: boolean;
  timestamp: Date;
}

export async function logUsage(entry: Omit<UsageLogEntry, "cost" | "timestamp">) {
  const db = getDb();
  const cost = calculateCost(entry.model, entry.inputTokens, entry.outputTokens);

  await db.collection<UsageLogEntry>("usageLogs").insertOne({
    ...entry,
    cost,
    timestamp: new Date(),
  });

  return cost;
}

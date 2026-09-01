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
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export async function logUsage(
  entry: Omit<UsageLogEntry, "cost" | "timestamp" | "success">
) {
  const db = getDb();
  const cost = calculateCost(entry.model, entry.inputTokens, entry.outputTokens);

  await db.collection<UsageLogEntry>("usageLogs").insertOne({
    ...entry,
    cost,
    success: true,
    timestamp: new Date(),
  });

  return cost;
}

// Trace aussi les échecs : indispensable pour calculer un vrai taux de succès
// par provider (sinon on ne voit que ce qui a marché, jamais ce qui a cassé).
export async function logFailure(entry: {
  apiKey: string;
  provider: string;
  model: string;
  fallback: boolean;
  latencyMs: number;
  errorMessage: string;
}) {
  const db = getDb();

  await db.collection<UsageLogEntry>("usageLogs").insertOne({
    ...entry,
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
    success: false,
    timestamp: new Date(),
  });
}
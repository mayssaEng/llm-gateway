import { getDb } from "../config/database";

export interface UsageSummary {
  totalRequests: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byProvider: Record<string, { requests: number; cost: number }>;
}

export async function getUsageSummary(apiKey: string): Promise<UsageSummary> {
  const db = getDb();
  const logs = await db.collection("usageLogs").find({ apiKey }).toArray();

  const summary: UsageSummary = {
    totalRequests: logs.length,
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    byProvider: {},
  };

  for (const log of logs) {
    summary.totalCost += log.cost;
    summary.totalInputTokens += log.inputTokens;
    summary.totalOutputTokens += log.outputTokens;

    if (!summary.byProvider[log.provider]) {
      summary.byProvider[log.provider] = { requests: 0, cost: 0 };
    }
    summary.byProvider[log.provider].requests += 1;
    summary.byProvider[log.provider].cost += log.cost;
  }

  summary.totalCost = Number(summary.totalCost.toFixed(6));

  return summary;
}

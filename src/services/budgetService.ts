import { getDb } from "../config/database";
import { findApiKey } from "../config/apiKeys";

export type BudgetStatus = "ok" | "warning" | "exceeded" | "unlimited";

export interface BudgetSnapshot {
  monthlyBudget: number | null; // null = pas de limite définie
  spentThisMonth: number;
  remaining: number | null;
  percentUsed: number | null; // 0-100, null si pas de budget
  status: BudgetStatus;
}

const WARNING_THRESHOLD = 0.8; // 80% du budget consommé -> avertissement

// Calcule combien une clé a dépensé depuis le 1er du mois en cours.
// On ne compte QUE les vraies dépenses (success: true) : un échec ne coûte rien.
async function getSpentThisMonth(apiKey: string): Promise<number> {
  const db = getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const logs = await db
    .collection("usageLogs")
    .find({ apiKey, timestamp: { $gte: startOfMonth }, success: true })
    .toArray();

  const total = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  return Number(total.toFixed(6));
}

export async function getBudgetSnapshot(apiKey: string): Promise<BudgetSnapshot> {
  const record = await findApiKey(apiKey);
  const spentThisMonth = await getSpentThisMonth(apiKey);

  if (!record?.monthlyBudget) {
    return {
      monthlyBudget: null,
      spentThisMonth,
      remaining: null,
      percentUsed: null,
      status: "unlimited",
    };
  }

  const remaining = Number((record.monthlyBudget - spentThisMonth).toFixed(6));
  const percentUsed = Number(((spentThisMonth / record.monthlyBudget) * 100).toFixed(1));

  let status: BudgetStatus = "ok";
  if (percentUsed >= 100) status = "exceeded";
  else if (percentUsed >= WARNING_THRESHOLD * 100) status = "warning";

  return {
    monthlyBudget: record.monthlyBudget,
    spentThisMonth,
    remaining,
    percentUsed,
    status,
  };
}

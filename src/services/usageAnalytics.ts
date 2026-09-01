import { getDb } from "../config/database";
import { UsageLogEntry } from "./usageLogger";

export interface TimeSeriesPoint {
  bucket: string; // ISO string tronqué à l'heure, ex: "2026-08-28T14"
  requests: number;
  cost: number;
  errors: number;
}

// Regroupe les logs par heure sur une fenêtre glissante (24h par défaut).
// Utile pour tracer une courbe "requêtes/coût dans le temps" sur le dashboard.
export async function getTimeSeries(
  apiKey: string,
  hours: number = 24
): Promise<TimeSeriesPoint[]> {
  const db = getDb();
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const logs = await db
    .collection<UsageLogEntry>("usageLogs")
    .find({ apiKey, timestamp: { $gte: since } })
    .sort({ timestamp: 1 })
    .toArray();

  const buckets = new Map<string, TimeSeriesPoint>();

  for (const log of logs) {
    const bucketKey = new Date(log.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, { bucket: bucketKey, requests: 0, cost: 0, errors: 0 });
    }

    const point = buckets.get(bucketKey)!;
    point.requests += 1;
    point.cost += log.cost;
    if (!log.success) point.errors += 1;
  }

  return Array.from(buckets.values())
    .map((point) => ({ ...point, cost: Number(point.cost.toFixed(6)) }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));
}

export interface ProviderStats {
  provider: string;
  requests: number;
  cost: number;
  errors: number;
  successRate: number; // en %
  avgLatencyMs: number;
}

// Compare les providers entre eux : volume, coût, fiabilité, vitesse.
// C'est ce qui permet de répondre à "quel provider est le plus fiable/rapide ?"
export async function getProviderStats(apiKey: string): Promise<ProviderStats[]> {
  const db = getDb();
  const logs = await db.collection<UsageLogEntry>("usageLogs").find({ apiKey }).toArray();

  type ProviderAccumulator = { requests: number; cost: number; errors: number; totalLatencyMs: number };
  const byProvider = new Map<string, ProviderAccumulator>();

  for (const log of logs) {
    if (!byProvider.has(log.provider)) {
      byProvider.set(log.provider, { requests: 0, cost: 0, errors: 0, totalLatencyMs: 0 });
    }

    const stats = byProvider.get(log.provider)!;
    stats.requests += 1;
    stats.cost += log.cost;
    stats.totalLatencyMs += log.latencyMs ?? 0;
    if (!log.success) stats.errors += 1;
  }

  return Array.from(byProvider.entries()).map(([provider, stats]) => ({
    provider,
    requests: stats.requests,
    cost: Number(stats.cost.toFixed(6)),
    errors: stats.errors,
    successRate: Number((((stats.requests - stats.errors) / stats.requests) * 100).toFixed(1)),
    avgLatencyMs: Math.round(stats.totalLatencyMs / stats.requests),
  }));
}
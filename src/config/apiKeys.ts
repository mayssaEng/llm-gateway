import crypto from "crypto";
import { getDb } from "./database";

export interface ApiKeyRecord {
  key: string;
  owner: string;
  active: boolean;
  isAdmin: boolean;
  createdAt: Date;
  monthlyBudget?: number; // en dollars ; undefined = pas de limite
}

export async function findApiKey(key: string): Promise<ApiKeyRecord | null> {
  const db = getDb();
  const record = await db.collection<ApiKeyRecord>("apiKeys").findOne({ key, active: true });
  return record;
}

// Génère une clé aléatoire de 192 bits (48 caractères hex) — impossible à deviner par force brute.
function generateKey(): string {
  return `sk-gateway-${crypto.randomBytes(24).toString("hex")}`;
}

export async function createApiKey(owner: string, isAdmin = false): Promise<ApiKeyRecord> {
  const db = getDb();
  const record: ApiKeyRecord = {
    key: generateKey(),
    owner,
    active: true,
    isAdmin,
    createdAt: new Date(),
  };
  await db.collection<ApiKeyRecord>("apiKeys").insertOne(record);
  return record;
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const db = getDb();
  return db.collection<ApiKeyRecord>("apiKeys").find().sort({ createdAt: -1 }).toArray();
}

export async function revokeApiKey(key: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .collection<ApiKeyRecord>("apiKeys")
    .updateOne({ key }, { $set: { active: false } });
  return result.matchedCount > 0;
}

export async function reactivateApiKey(key: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .collection<ApiKeyRecord>("apiKeys")
    .updateOne({ key }, { $set: { active: true } });
  return result.matchedCount > 0;
}

// Fixe (ou retire, si budget est null) le plafond mensuel d'une clé.
export async function setMonthlyBudget(key: string, budget: number | null): Promise<boolean> {
  const db = getDb();
  const collection = db.collection<ApiKeyRecord>("apiKeys");
  const result =
    budget === null
      ? await collection.updateOne({ key }, { $unset: { monthlyBudget: "" as const } })
      : await collection.updateOne({ key }, { $set: { monthlyBudget: budget } });
  return result.matchedCount > 0;
}

// Affiche seulement le début et la fin de la clé (ex: "sk-gateway-a1b2...9f3d"),
// pour ne jamais réexposer une clé complète après sa création initiale.
export function maskKey(key: string): string {
  if (key.length <= 14) return "****";
  return `${key.slice(0, 14)}...${key.slice(-4)}`;
}
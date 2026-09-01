import crypto from "crypto";
import { getDb } from "./database";

export interface ApiKeyRecord {
  key: string;
  owner: string;
  active: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

export async function findApiKey(key: string): Promise<ApiKeyRecord | null> {
  const db = getDb();
  const record = await db.collection<ApiKeyRecord>("apiKeys").findOne({ key, active: true });
  return record;
}

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

export function maskKey(key: string): string {
  if (key.length <= 14) return "****";
  return `${key.slice(0, 14)}...${key.slice(-4)}`;
}
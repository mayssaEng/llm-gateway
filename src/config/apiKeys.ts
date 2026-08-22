import { getDb } from "./database";

export interface ApiKeyRecord {
  key: string;
  owner: string;
  active: boolean;
}

export async function findApiKey(key: string): Promise<ApiKeyRecord | null> {
  const db = getDb();
  const record = await db.collection<ApiKeyRecord>("apiKeys").findOne({ key, active: true });
  return record;
}
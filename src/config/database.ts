import { MongoClient, Db } from "mongodb";

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db("llm-gateway");

  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized or unavailable. Check MongoDB Atlas connectivity.");
  }
  return db;
}

export function isDatabaseConnected(): boolean {
  return !!db;
}
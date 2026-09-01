import "dotenv/config";
import { connectToDatabase } from "../config/database";

const PROVIDERS = ["groq", "ollama", "openai"];
const MODELS: Record<string, string[]> = {
  groq: ["openai/gpt-oss-20b", "openai/gpt-oss-120b"],
  ollama: ["llama3.2:1b"],
  openai: ["gpt-4o-mini"],
};
const PRICING: Record<string, { input: number; output: number }> = {
  "openai/gpt-oss-20b": { input: 0.075, output: 0.30 },
  "openai/gpt-oss-120b": { input: 0.15, output: 0.60 },
  "llama3.2:1b": { input: 0, output: 0 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
};
const API_KEYS = ["sk-gateway-support-001", "sk-gateway-marketing-001"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const db = await connectToDatabase();
  const collection = db.collection("usageLogs");

  const now = Date.now();
  const entries = [];

  for (let i = 0; i < 80; i++) {
    const provider = PROVIDERS[randomInt(0, PROVIDERS.length - 1)];
    const models = MODELS[provider];
    const model = models[randomInt(0, models.length - 1)];
    const inputTokens = randomInt(40, 400);
    const outputTokens = randomInt(20, 500);
    const pricing = PRICING[model];
    const cost = Number(
      ((inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output).toFixed(6)
    );
    const daysAgo = randomInt(0, 6);
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - randomInt(0, 20000000));

    entries.push({
      apiKey: API_KEYS[randomInt(0, API_KEYS.length - 1)],
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      fallback: provider === "groq" && Math.random() < 0.15,
      timestamp,
    });
  }

  await collection.insertMany(entries);
  console.log(`Seeded ${entries.length} demo usage logs`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

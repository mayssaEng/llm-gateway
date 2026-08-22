import "dotenv/config";
import { connectToDatabase } from "../config/database";

async function seed() {
  const db = await connectToDatabase();
  const collection = db.collection("apiKeys");

  await collection.deleteMany({});

  await collection.insertMany([
    { key: "sk-gateway-support-001", owner: "chatbot-support", active: true },
    { key: "sk-gateway-marketing-001", owner: "marketing-tool", active: true },
  ]);

  console.log("API keys seeded successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

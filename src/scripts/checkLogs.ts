import "dotenv/config";
import { connectToDatabase } from "../config/database";

async function checkLogs() {
  const db = await connectToDatabase();
  const logs = await db.collection("usageLogs").find({}).sort({ timestamp: -1 }).limit(5).toArray();

  console.log(`Found ${logs.length} recent logs:`);
  console.log(JSON.stringify(logs, null, 2));

  process.exit(0);
}

checkLogs().catch((err) => {
  console.error(err);
  process.exit(1);
});

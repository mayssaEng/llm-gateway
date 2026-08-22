import "dotenv/config";
import express from "express";
import chatRoute from "./routes/chat.route";
import usageRoute from "./routes/usage.route";
import { connectToDatabase } from "./config/database";

const app = express();
app.use(express.json());
app.use("/v1/chat", chatRoute);
app.use("/v1/usage", usageRoute);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
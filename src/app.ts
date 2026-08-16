import "dotenv/config";
import express from "express";
import chatRoute from "./routes/chat.route";

const app = express();
app.use(express.json());
app.use("/v1/chat", chatRoute);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import chatRoute from "./routes/chat.route";
import usageRoute from "./routes/usage.route";
import healthRoute from "./routes/health.route";
import keysRoute from "./routes/keys.route";
import { openApiSpec } from "./config/openapi";
import { connectToDatabase, isDatabaseConnected } from "./config/database";

const app = express();
app.use(cors()); // nécessaire pour que le dashboard Angular (autre port) puisse appeler l'API
app.use(express.json());
app.use("/v1/chat", chatRoute);
app.use("/v1/usage", usageRoute);
app.use("/v1/health", healthRoute);
app.use("/v1/keys", keysRoute);

// Documentation interactive de l'API, 100% statique (aucun appel à la DB) :
// consultable dans le navigateur sur http://localhost:3000/docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => res.json({ status: "ok", mongoConnected: isDatabaseConnected() }));

const PORT = process.env.PORT || 3000;

// Le serveur démarre immédiatement, sans attendre MongoDB : ça permet de tester
// tout ce qui n'a pas besoin de la DB (docs Swagger, health check du process)
// même quand Atlas est injoignable. Les routes qui ont besoin de la DB
// échoueront proprement avec une erreur 500 explicite, au lieu de bloquer
// tout le serveur au démarrage.
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
  connectWithRetry();
});

function connectWithRetry(attempt = 1) {
  connectToDatabase()
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => {
      const delayMs = Math.min(5000 * attempt, 30000); // backoff jusqu'à 30s max
      console.error(
        `[WARN] MongoDB connection failed (attempt ${attempt}): ${err.message}. Retry in ${delayMs / 1000}s...`
      );
      setTimeout(() => connectWithRetry(attempt + 1), delayMs);
    });
}
import { Router, Response } from "express";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { allProviders } from "../services/providerRouter";

const router = Router();

// GET /v1/health -> statut up/down + latence de chaque provider, en parallèle.
router.get("/", authenticateApiKey, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const results = await Promise.all(allProviders.map((provider) => provider.healthCheck()));
    const allUp = results.every((r) => r.status === "up");

    res.json({
      status: allUp ? "healthy" : "degraded",
      providers: results,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
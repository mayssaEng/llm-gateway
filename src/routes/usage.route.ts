import { Router, Response } from "express";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUsageSummary } from "../services/usageSummary";
import { getTimeSeries, getProviderStats } from "../services/usageAnalytics";

const router = Router();

router.get("/", authenticateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiKey = req.headers["authorization"]!.replace("Bearer ", "");
    const summary = await getUsageSummary(apiKey);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /v1/usage/timeseries?hours=24 -> points horaires pour tracer une courbe
router.get("/timeseries", authenticateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiKey = req.headers["authorization"]!.replace("Bearer ", "");
    const hours = req.query.hours ? Number(req.query.hours) : 24;
    const series = await getTimeSeries(apiKey, hours);
    res.json(series);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /v1/usage/by-provider -> comparaison requêtes/coût/latence/fiabilité par provider
router.get("/by-provider", authenticateApiKey, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiKey = req.headers["authorization"]!.replace("Bearer ", "");
    const stats = await getProviderStats(apiKey);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
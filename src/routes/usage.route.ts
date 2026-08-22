import { Router, Response } from "express";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getUsageSummary } from "../services/usageSummary";

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

export default router;

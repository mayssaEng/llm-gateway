import { Router, Response } from "express";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { createApiKey, listApiKeys, revokeApiKey, reactivateApiKey, setMonthlyBudget } from "../config/apiKeys";

const router = Router();

router.use(authenticateApiKey, requireAdmin);

router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { owner, isAdmin } = req.body;
    if (!owner || typeof owner !== "string") {
      return res.status(400).json({ error: "owner (string) is required" });
    }
    const record = await createApiKey(owner, Boolean(isAdmin));
    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const keys = await listApiKeys();
    res.json(keys);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:key", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = req.params.key as string;
    const revoked = await revokeApiKey(key);
    if (!revoked) return res.status(404).json({ error: "Key not found" });
    res.json({ revoked: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:key/reactivate", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = req.params.key as string;
    const reactivated = await reactivateApiKey(key);
    if (!reactivated) return res.status(404).json({ error: "Key not found" });
    res.json({ reactivated: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:key/budget", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = req.params.key as string;
    const { monthlyBudget } = req.body;

    if (monthlyBudget !== null && (typeof monthlyBudget !== "number" || monthlyBudget <= 0)) {
      return res.status(400).json({ error: "monthlyBudget must be a positive number or null" });
    }

    const updated = await setMonthlyBudget(key, monthlyBudget);
    if (!updated) return res.status(404).json({ error: "Key not found" });
    res.json({ key, monthlyBudget });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router, Response } from "express";
import { OpenAIProvider } from "../providers/openai.provider";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";

const router = Router();
const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!);

router.post(
  "/completions",
  authenticateApiKey,
  rateLimit,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await openaiProvider.complete(req.body);
      res.json({ ...result, requestedBy: req.apiKeyOwner });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
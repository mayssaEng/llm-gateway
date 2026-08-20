import { Router, Response } from "express";
import { selectProvider, getFallbackProvider, FALLBACK_MODEL } from "../services/providerRouter";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post(
  "/completions",
  authenticateApiKey,
  rateLimit,
  async (req: AuthenticatedRequest, res: Response) => {
    const requestedModel = req.body.model;
    const primaryProvider = selectProvider(requestedModel);

    try {
      const result = await primaryProvider.complete(req.body);
      return res.json({ ...result, requestedBy: req.apiKeyOwner, fallback: false });
    } catch (primaryError: any) {
      console.error(`[WARN] Provider "${primaryProvider.name}" failed: ${primaryError.message}`);

      const fallbackProvider = getFallbackProvider();

      // Évite de "fallback vers soi-même" si c'était déjà Ollama qui a échoué
      if (fallbackProvider.name === primaryProvider.name) {
        return res.status(500).json({ error: primaryError.message });
      }

      try {
        const fallbackResult = await fallbackProvider.complete({
          ...req.body,
          model: FALLBACK_MODEL,
        });

        return res.json({
          ...fallbackResult,
          requestedBy: req.apiKeyOwner,
          fallback: true,
          originalProvider: primaryProvider.name,
          originalError: primaryError.message,
        });
      } catch (fallbackError: any) {
        return res.status(500).json({
          error: "Both primary and fallback providers failed",
          primaryError: primaryError.message,
          fallbackError: fallbackError.message,
        });
      }
    }
  }
);

export default router;
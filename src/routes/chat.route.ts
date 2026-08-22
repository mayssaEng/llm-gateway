import { Router, Response } from "express";
import { selectProvider, getFallbackProvider, FALLBACK_MODEL } from "../services/providerRouter";
import { authenticateApiKey, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";
import { logUsage } from "../services/usageLogger";
import { getCachedResponse, setCachedResponse } from "../services/cache";

const router = Router();

router.post(
  "/completions",
  authenticateApiKey,
  rateLimit,
  async (req: AuthenticatedRequest, res: Response) => {
    const requestedModel = req.body.model;
    const messages = req.body.messages;
    const apiKey = req.headers["authorization"]!.replace("Bearer ", "");

    // Vérifie le cache avant tout appel provider
    const cached = getCachedResponse(requestedModel, messages);
    if (cached) {
      return res.json({ ...cached, requestedBy: req.apiKeyOwner, cached: true });
    }

    const primaryProvider = selectProvider(requestedModel);

    try {
      const result = await primaryProvider.complete(req.body);

      const cost = await logUsage({
        apiKey,
        provider: result.provider,
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        fallback: false,
      });

      const responseBody = { ...result, fallback: false, cost };
      setCachedResponse(requestedModel, messages, responseBody);

      return res.json({ ...responseBody, requestedBy: req.apiKeyOwner, cached: false });
    } catch (primaryError: any) {
      console.error(`[WARN] Provider "${primaryProvider.name}" failed: ${primaryError.message}`);

      const fallbackProvider = getFallbackProvider();

      if (fallbackProvider.name === primaryProvider.name) {
        return res.status(500).json({ error: primaryError.message });
      }

      try {
        const fallbackResult = await fallbackProvider.complete({
          ...req.body,
          model: FALLBACK_MODEL,
        });

        const cost = await logUsage({
          apiKey,
          provider: fallbackResult.provider,
          model: fallbackResult.model,
          inputTokens: fallbackResult.inputTokens,
          outputTokens: fallbackResult.outputTokens,
          fallback: true,
        });

        const responseBody = {
          ...fallbackResult,
          fallback: true,
          originalProvider: primaryProvider.name,
          originalError: primaryError.message,
          cost,
        };
        setCachedResponse(requestedModel, messages, responseBody);

        return res.json({ ...responseBody, requestedBy: req.apiKeyOwner, cached: false });
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
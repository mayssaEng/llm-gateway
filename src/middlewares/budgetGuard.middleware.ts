import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { getBudgetSnapshot } from "../services/budgetService";

// À placer APRÈS authenticateApiKey. Coupe la requête AVANT tout appel provider
// si le budget mensuel de la clé est dépassé — c'est le "disjoncteur" qui évite
// une facture qui explose sans intervention humaine.
export async function budgetGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers["authorization"]!.replace("Bearer ", "");
    const snapshot = await getBudgetSnapshot(apiKey);

    if (snapshot.status === "exceeded") {
      return res.status(429).json({
        error: "Monthly budget exceeded",
        monthlyBudget: snapshot.monthlyBudget,
        spentThisMonth: snapshot.spentThisMonth,
      });
    }

    next();
  } catch (err: any) {
    // Si la vérification budget échoue (ex: DB temporairement indisponible),
    // on laisse passer la requête plutôt que de bloquer tout le monde par erreur —
    // le budget est une protection, pas une fonctionnalité critique bloquante.
    console.error(`[WARN] Budget check failed, allowing request: ${err.message}`);
    next();
  }
}
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

// À utiliser APRÈS authenticateApiKey dans la chaîne de middlewares.
// Protège les routes sensibles (gestion des clés API) : seule une clé
// marquée isAdmin:true peut créer/lister/révoquer d'autres clés.
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
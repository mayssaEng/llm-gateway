// Spécification OpenAPI 3.0 du gateway. Fichier statique : ne touche jamais
// à la base de données, donc consultable même quand Mongo est injoignable.
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "LLM Gateway API",
    version: "1.0.0",
    description:
      "Passerelle multi-provider pour LLM (OpenAI, Groq, Ollama) avec authentification par clé API, fallback automatique, cache et suivi des coûts.",
  },
  servers: [{ url: "http://localhost:3000", description: "Développement local" }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "http",
        scheme: "bearer",
        description: "Clé API au format 'sk-gateway-...', envoyée en header Authorization: Bearer <clé>",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    "/v1/chat/completions": {
      post: {
        summary: "Génère une complétion de chat",
        description:
          "Route la requête vers le provider approprié selon le modèle demandé, avec fallback automatique vers Groq en cas d'échec.",
        tags: ["Chat"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model", "messages"],
                properties: {
                  model: { type: "string", example: "openai/gpt-oss-20b" },
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: { type: "string", enum: ["system", "user", "assistant"] },
                        content: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Complétion générée avec succès" },
          "401": { description: "Clé API manquante ou invalide" },
          "429": { description: "Limite de requêtes dépassée" },
          "500": { description: "Tous les providers (primaire + fallback) ont échoué" },
        },
      },
    },
    "/v1/usage": {
      get: {
        summary: "Résumé global de l'usage pour la clé API appelante",
        tags: ["Usage"],
        responses: { "200": { description: "Résumé (coût total, nb requêtes, etc.)" } },
      },
    },
    "/v1/usage/timeseries": {
      get: {
        summary: "Série temporelle des requêtes/coûts, groupée par heure",
        tags: ["Usage"],
        parameters: [
          {
            name: "hours",
            in: "query",
            schema: { type: "integer", default: 24 },
            description: "Fenêtre glissante en heures",
          },
        ],
        responses: { "200": { description: "Liste de points horaires (requests, cost, errors)" } },
      },
    },
    "/v1/usage/by-provider": {
      get: {
        summary: "Statistiques comparées par provider (Groq, Ollama, OpenAI)",
        tags: ["Usage"],
        responses: {
          "200": { description: "Requêtes, coût, taux de succès et latence moyenne par provider" },
        },
      },
    },
    "/v1/health": {
      get: {
        summary: "Statut en temps réel de chaque provider (up/down + latence)",
        tags: ["Health"],
        responses: { "200": { description: "healthy ou degraded, avec le détail par provider" } },
      },
    },
    "/v1/keys": {
      post: {
        summary: "Crée une nouvelle clé API (admin uniquement)",
        tags: ["Keys (admin)"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["owner"],
                properties: {
                  owner: { type: "string", example: "mon-nouveau-service" },
                  isAdmin: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Clé créée (renvoyée en clair une seule fois)" },
          "403": { description: "La clé appelante n'est pas admin" },
        },
      },
      get: {
        summary: "Liste toutes les clés API (masquées) — admin uniquement",
        tags: ["Keys (admin)"],
        responses: { "200": { description: "Liste des clés, chacune masquée sauf owner/active/isAdmin" } },
      },
    },
    "/v1/keys/{key}": {
      delete: {
        summary: "Révoque une clé API (soft delete, réversible) — admin uniquement",
        tags: ["Keys (admin)"],
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Clé révoquée" }, "404": { description: "Clé introuvable" } },
      },
    },
    "/v1/keys/{key}/reactivate": {
      post: {
        summary: "Réactive une clé API précédemment révoquée — admin uniquement",
        tags: ["Keys (admin)"],
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Clé réactivée" }, "404": { description: "Clé introuvable" } },
      },
    },
  },
};
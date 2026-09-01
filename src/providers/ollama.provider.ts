import { LLMProvider, CompletionRequest, CompletionResponse, ProviderHealth } from "../types/llm";

export class OllamaProvider implements LLMProvider {
  name = "ollama";
  private baseUrl = "http://localhost:11434";

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      provider: this.name,
      model: data.model,
      content: data.message?.content ?? "",
      inputTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
    };
  }

  // Ping léger : liste les modèles installés localement, sans générer de texte.
  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return { provider: this.name, status: "down", latencyMs, error: `HTTP ${response.status}` };
      }
      return { provider: this.name, status: "up", latencyMs };
    } catch (err: any) {
      return { provider: this.name, status: "down", latencyMs: Date.now() - start, error: err.message };
    }
  }
}
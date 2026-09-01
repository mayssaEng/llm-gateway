import OpenAI from "openai";
import { LLMProvider, CompletionRequest, CompletionResponse, ProviderHealth } from "../types/llm";

export class GroqProvider implements LLMProvider {
  name = "groq";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: req.model,
      messages: req.messages,
      max_tokens: req.maxTokens,
    });

    return {
      provider: this.name,
      model: response.model,
      content: response.choices[0].message.content ?? "",
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  }

  // Ping léger : liste les modèles disponibles côté Groq, sans générer de texte
  // (donc ça ne coûte rien et ne compte pas dans le rate limit de complétion).
  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.client.models.list();
      return { provider: this.name, status: "up", latencyMs: Date.now() - start };
    } catch (err: any) {
      return { provider: this.name, status: "down", latencyMs: Date.now() - start, error: err.message };
    }
  }
}
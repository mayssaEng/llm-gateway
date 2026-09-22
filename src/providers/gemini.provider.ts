import OpenAI from "openai";
import { LLMProvider, CompletionRequest, CompletionResponse, ProviderHealth } from "../types/llm";

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
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

  // Ping leger : liste les modeles disponibles cote Gemini, sans generer de texte.
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

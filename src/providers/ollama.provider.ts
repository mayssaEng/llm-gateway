import { LLMProvider, CompletionRequest, CompletionResponse } from "../types/llm";

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
}

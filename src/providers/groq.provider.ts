import OpenAI from "openai";
import { LLMProvider, CompletionRequest, CompletionResponse } from "../types/llm";

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
}

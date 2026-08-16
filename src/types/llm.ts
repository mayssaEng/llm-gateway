export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

export interface CompletionResponse {
  provider: string;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LLMProvider {
  name: string;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
}
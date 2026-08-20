import { LLMProvider } from "../types/llm";
import { OpenAIProvider } from "../providers/openai.provider";
import { OllamaProvider } from "../providers/ollama.provider";

const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!);
const ollamaProvider = new OllamaProvider();

const OLLAMA_MODEL_PREFIXES = ["llama", "mistral", "phi", "gemma"];

export function selectProvider(model: string): LLMProvider {
  const isOllamaModel = OLLAMA_MODEL_PREFIXES.some((prefix) =>
    model.toLowerCase().startsWith(prefix)
  );

  return isOllamaModel ? ollamaProvider : openaiProvider;
}

// Le modèle local utilisé comme filet de sécurité en cas de panne du provider principal
export const FALLBACK_MODEL = "llama3.2:1b";

export function getFallbackProvider(): LLMProvider {
  return ollamaProvider;
}
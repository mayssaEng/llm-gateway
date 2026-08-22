import { LLMProvider } from "../types/llm";
import { OpenAIProvider } from "../providers/openai.provider";
import { OllamaProvider } from "../providers/ollama.provider";
import { GroqProvider } from "../providers/groq.provider";

const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!);
const ollamaProvider = new OllamaProvider();
const groqProvider = new GroqProvider(process.env.GROQ_API_KEY!);

const OLLAMA_MODEL_PREFIXES = ["llama3.2", "mistral", "phi", "gemma"];
const GROQ_MODEL_PREFIXES = ["openai/gpt-oss", "qwen/", "moonshotai/"];

export function selectProvider(model: string): LLMProvider {
  const lower = model.toLowerCase();

  if (GROQ_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return groqProvider;
  }
  if (OLLAMA_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return ollamaProvider;
  }
  return openaiProvider;
}

export const FALLBACK_MODEL = "openai/gpt-oss-20b";

export function getFallbackProvider(): LLMProvider {
  return groqProvider;
}
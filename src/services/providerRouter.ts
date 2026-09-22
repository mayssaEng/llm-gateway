import { LLMProvider } from "../types/llm";
import { OpenAIProvider } from "../providers/openai.provider";
import { OllamaProvider } from "../providers/ollama.provider";
import { GroqProvider } from "../providers/groq.provider";
import { GeminiProvider } from "../providers/gemini.provider";

const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!);
const ollamaProvider = new OllamaProvider();
const groqProvider = new GroqProvider(process.env.GROQ_API_KEY!);
const geminiProvider = new GeminiProvider(process.env.GEMINI_API_KEY!);

const OLLAMA_MODEL_PREFIXES = ["llama3.2", "mistral", "phi", "gemma"];
const GROQ_MODEL_PREFIXES = ["openai/gpt-oss", "qwen/", "moonshotai/"];
const GEMINI_MODEL_PREFIXES = ["gemini-"];

export function selectProvider(model: string): LLMProvider {
  const lower = model.toLowerCase();

  if (GROQ_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return groqProvider;
  }
  if (GEMINI_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return geminiProvider;
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

// Utilise par la route /v1/health pour verifier l'etat de tous les providers d'un coup.
export const allProviders: LLMProvider[] = [openaiProvider, ollamaProvider, groqProvider, geminiProvider];

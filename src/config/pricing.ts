interface ModelPricing {
  input: number;  // prix par million de tokens input, en dollars
  output: number; // prix par million de tokens output, en dollars
}

export const PRICING: Record<string, ModelPricing> = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4o": { input: 2.50, output: 10.00 },
  "openai/gpt-oss-20b": { input: 0.075, output: 0.30 },
  "openai/gpt-oss-120b": { input: 0.15, output: 0.60 },
  "llama3.2:1b": { input: 0, output: 0 }, // Ollama local, gratuit
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model] ?? { input: 0, output: 0 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}
